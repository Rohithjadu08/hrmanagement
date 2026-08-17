import { supabaseAdmin } from '../../config/supabaseClient.js'
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { PromptTemplate } from '@langchain/core/prompts'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

function getEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    model: 'gemini-embedding-2',
    apiKey: process.env.GOOGLE_API_KEY
  })
}

function getLlm() {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY
  })
}

export const RagService = {
  async processDocument(buffer, fileName, fileType, uploaderId) {
    try {
      // 1. Create document entry
      const { data: doc, error: docErr } = await supabaseAdmin
        .from('documents')
        .insert({
          title: fileName,
          file_name: fileName,
          file_type: fileType,
          storage_path: `documents/${Date.now()}_${fileName}`,
          uploaded_by: uploaderId,
          status: 'processing'
        })
        .select('id')
        .single()

      if (docErr) throw docErr

      const documentId = doc.id
      let text = ''

      // 2. Extract text
      if (fileType === 'application/pdf') {
        const parsed = await pdfParse(buffer)
        text = parsed.text
      } else {
        text = buffer.toString('utf-8')
      }

      // 3. Chunk text (simple approach for demo)
      const chunkSize = 1000
      const overlap = 100
      const chunks = []
      for (let i = 0; i < text.length; i += chunkSize - overlap) {
        chunks.push(text.slice(i, i + chunkSize))
      }

      // 4. Generate embeddings and save chunks
      const vectors = await getEmbeddings().embedDocuments(chunks)
      console.log('Number of chunks:', chunks.length)
      console.log('First chunk length:', chunks[0]?.length)
      console.log('Number of vectors returned:', vectors.length)
      console.log('First vector dimension:', vectors[0]?.length)
      
      const chunkRecords = chunks.map((content, i) => ({
        document_id: documentId,
        content,
        embedding: vectors[i],
        chunk_index: i,
        metadata: { source: fileName }
      }))

      const { error: chunkErr } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunkRecords)

      if (chunkErr) throw chunkErr

      // 5. Mark ready
      await supabaseAdmin
        .from('documents')
        .update({ status: 'ready' })
        .eq('id', documentId)

      return { success: true, documentId }
    } catch (error) {
      console.error('Processing failed:', error)
      return { success: false, error: error.message }
    }
  },

  async askQuestion(question, userId) {
    try {
      // 1. Embed user query
      const queryEmbedding = await getEmbeddings().embedQuery(question)

      // 2. Vector search via RPC
      const { data: matches, error: rpcErr } = await supabaseAdmin.rpc('match_document_chunks', {
        query_embedding: queryEmbedding,
        match_threshold: 0.50,
        match_count: 5
      })

      if (rpcErr) throw rpcErr

      // 3. TruthSeeker / Generate Answer
      if (!matches || matches.length === 0) {
        return { answer: 'I couldn\'t find enough information in the HR knowledge base to answer this accurately. Please contact HR for clarification.', sources: [] }
      }

      const context = matches.map(m => m.content).join('\n\n')
      const sources = [...new Set(matches.map(m => m.metadata.source))]

      const prompt = PromptTemplate.fromTemplate(`
You are an HR Assistant. Answer the question based ONLY on the provided context from company documents.
If the answer is not in the context, explicitly say that the information could not be found in the available HR knowledge base. Do not fabricate answers.
Context: {context}

Question: {question}
      `)

      const chain = prompt.pipe(getLlm())
      const result = await chain.invoke({ context, question })

      return {
        answer: result.content,
        sources
      }
    } catch (error) {
      console.error('RAG failed:', error)
      throw error
    }
  }
}
