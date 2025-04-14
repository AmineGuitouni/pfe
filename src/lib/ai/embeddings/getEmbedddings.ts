import { TextLoader } from "langchain/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { JSONLoader, JSONLinesLoader } from "langchain/document_loaders/fs/json";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
// Removed HTMLoader and MarkdownLoader imports as they couldn't be resolved.
// Using TextLoader as a fallback for these types.
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";
import { cohere } from "@/lib/ai/cohere"; // Import Cohere client

// Default chunking parameters (can be overridden)
const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

// Helper function to create splitter
const createSplitter = (chunkSize: number, chunkOverlap: number) => {
    return new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    });
};

// --- Parsing Functions ---

async function parseText(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with TextLoader...");
    const loader = new TextLoader(file);
    const docs = await loader.load();
    const splitter = createSplitter(chunkSize, chunkOverlap);
    return splitter.splitDocuments(docs);
}

async function parsePdf(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with PDFLoader...");
    // PDFLoader specific options might be needed depending on pdf-parse version/config
    const loader = new PDFLoader(file, {
        splitPages: false, // Load all pages as one doc then split, might be better for context
    });
    const docs = await loader.load();
    const splitter = createSplitter(chunkSize, chunkOverlap);
    return splitter.splitDocuments(docs);
}

async function parseCsv(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with CSVLoader...");
    // CSVLoader might need column specification depending on the CSV structure
    // By default, it loads each row as a document.
    const loader = new CSVLoader(file); // Check if specific column needed: { column: "your_text_column" }
    const docs = await loader.load();
    // Splitting row-based docs might not be ideal with RecursiveCharacterTextSplitter
    // Consider if a different splitter or strategy is needed for CSVs.
    // For now, applying the standard splitter.
    const splitter = createSplitter(chunkSize, chunkOverlap);
    return splitter.splitDocuments(docs);
}

async function parseJson(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with JSONLoader...");
    // JSONLoader loads the entire file as one document by default.
    // Pointers can be used for specific text fields if the structure is known, e.g., new JSONLoader(file, "/text")
    const loader = new JSONLoader(file);
    const docs = await loader.load();
    const splitter = createSplitter(chunkSize, chunkOverlap);
    return splitter.splitDocuments(docs);
}

async function parseJsonl(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with JSONLinesLoader...");
    // Requires a pointer to the text field within each JSON line. Adjust '/text' as needed.
    // Example: If each line is { "content": "...", "metadata": {...} }, use "/content"
    const loader = new JSONLinesLoader(file, "/text"); // Adjust pointer based on your JSONL structure
    const docs = await loader.load();
    const splitter = createSplitter(chunkSize, chunkOverlap);
    // Splitting might not be necessary if each line is already a small document.
    // return docs; // Option: return docs directly if splitting isn't desired per line
    return splitter.splitDocuments(docs); // Apply splitter if lines can be long
}

async function parseDocx(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with DocxLoader...");
    const loader = new DocxLoader(file);
    const docs = await loader.load();
    const splitter = createSplitter(chunkSize, chunkOverlap);
    return splitter.splitDocuments(docs);
}

async function parsePptx(file: Blob, chunkSize: number, chunkOverlap: number): Promise<Document[]> {
    console.log("Parsing with PPTXLoader...");
    const loader = new PPTXLoader(file);
    const docs = await loader.load();
    const splitter = createSplitter(chunkSize, chunkOverlap);
    return splitter.splitDocuments(docs);
}

// Helper function to convert Blob/File to Base64 Data URI (Node.js compatible)
async function convertBlobToBase64DataUri(file: File): Promise<string> {
    try {
        // File/Blob objects in Node context often provide arrayBuffer()
        const arrayBuffer = await file.arrayBuffer();
        // Convert ArrayBuffer to Node.js Buffer
        const buffer = Buffer.from(arrayBuffer);
        // Convert Buffer to Base64 string
        const base64String = buffer.toString('base64');
        // Get MIME type from file or use a default
        const mimeType = file.type || 'application/octet-stream';
        // Construct the Data URI
        return `data:${mimeType};base64,${base64String}`;
    } catch (error) {
        console.error("Error converting file to Base64 Data URI:", error);
        // Ensure a proper error message is thrown
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to convert file to Base64 Data URI: ${errorMessage}`);
    }
}


// --- Main Orchestration Function ---

/**
 * Parses text files based on their extension, splits them into chunks, OR converts image files to Base64.
 * Generates embeddings using Cohere for either the text chunks or the image data.
 * Returns the float embeddings.
 *
 * @param file The File object to parse.
 * @param chunkSize The desired size of each text chunk. Defaults to 1000.
 * @param chunkOverlap The desired overlap between consecutive chunks. Defaults to 200.
 * @returns A Promise resolving to an array of float embeddings (number[][]) or undefined if embedding fails.
 * @throws Error if the file extension cannot be determined, is unsupported, or processing/embedding fails.
 */
export async function getFileEmbedddings(
    file: File,
    chunkSize: number = DEFAULT_CHUNK_SIZE,
    chunkOverlap: number = DEFAULT_CHUNK_OVERLAP
): Promise<number[][] | undefined> {
    // Extract file extension reliably
    const fileName = file.name || '';
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : '';

    if (!fileExtension) {
        // Try using MIME type as a fallback, though less reliable for some types
        const mimeType = file.type;
        console.warn(`Could not determine file extension from name: ${fileName}. Trying MIME type: ${mimeType}`);
        // Add logic here to map common MIME types to extensions if needed, e.g.
        // if (mimeType === 'application/pdf') fileExtension = 'pdf';
        // ... etc.
        // If still no extension, throw error.
        if (!mimeType) throw new Error("Could not determine file type from name or MIME type.");
        // For now, we'll rely on the extension primarily. Throw if not found.
         throw new Error(`Could not determine file extension for file: ${fileName}`);

    }

    console.log(`Attempting to parse file: ${fileName}, Detected Extension: ${fileExtension}, Size: ${file.size} bytes`);

    // --- Handle Image Files ---
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];
    if (imageExtensions.includes(fileExtension)) {
        console.log(`Processing image file: ${fileName}`);
        try {
            const imageBase64 = await convertBlobToBase64DataUri(file);
            console.log(`Generating embedding for image: ${fileName}`);

            const embedRes = await cohere.embed({
                model: "embed-multilingual-v3.0", // This model supports multimodal embeddings
                images: [imageBase64],
                inputType: "image", // Explicitly set inputType for images
                embeddingTypes: ["float"],
            });

            if (!embedRes.embeddings?.float) {
                console.error(`Cohere API did not return float embeddings for image file: ${fileName}`);
                throw new Error("Failed to get float embeddings for image from Cohere API.");
            }

            console.log(`Successfully generated ${embedRes.embeddings.float.length} embedding(s) for image: ${fileName}`);
            // Image embedding typically returns one vector for the whole image
            return embedRes.embeddings.float;

        } catch (error: any) {
            console.error(`Error processing or embedding image file ${fileName}:`, error);
            throw new Error(`Failed to process or embed image file ${fileName}. Reason: ${error.message || error}`);
        }
    }

    // --- Handle Text-Based Files ---
    console.log(`Processing text-based file: ${fileName}`);
    let chunks: Document[] = [];
    try {
        switch (fileExtension) {
            case 'txt':
                chunks = await parseText(file, chunkSize, chunkOverlap);
                break;
            case 'pdf':
                chunks = await parsePdf(file, chunkSize, chunkOverlap);
                break;
            case 'csv':
                chunks = await parseCsv(file, chunkSize, chunkOverlap);
                break;
            case 'json':
                chunks = await parseJson(file, chunkSize, chunkOverlap);
                break;
            case 'jsonl':
                chunks = await parseJsonl(file, chunkSize, chunkOverlap);
                break;
            case 'html':
            case 'htm': // Handle .htm as well
            case 'md': // Using TextLoader as fallback
                console.log(`Using TextLoader fallback for .${fileExtension}`);
                chunks = await parseText(file, chunkSize, chunkOverlap);
                break;
            case 'docx':
                chunks = await parseDocx(file, chunkSize, chunkOverlap);
                break;
            case 'pptx':
                chunks = await parsePptx(file, chunkSize, chunkOverlap);
                break;
            // Note: Image types are handled above
            default:
                // This case should ideally not be reached if image check is exhaustive
                // but kept as a safeguard.
                console.error(`Unsupported file type: '.${fileExtension}' for file: ${fileName}`);
                throw new Error(`Unsupported file type: ${fileExtension}`);
        }
    } catch (error: any) {
        console.error(`Error parsing text file ${fileName} (Type: ${fileExtension}):`, error);
        throw new Error(`Failed to parse text file ${fileName}. Reason: ${error.message || error}`);
    }

    if (!chunks || chunks.length === 0) {
        console.warn(`No text chunks extracted from file: ${fileName}`);
        return undefined; // Or return empty array []
    }

    const texts = chunks.map(chunk => chunk.pageContent);
    console.log(`Generating embeddings for ${texts.length} text chunks from file: ${fileName}`);

    try {
        const embedRes = await cohere.embed({
            model: "embed-multilingual-v3.0",
            texts: texts,
            inputType: "search_document", // Keep for text documents
            embeddingTypes: ["float"],
        });

        if (!embedRes.embeddings?.float) {
             console.error(`Cohere API did not return float embeddings for text file: ${fileName}`);
             throw new Error("Failed to get float embeddings for text from Cohere API.");
        }

        console.log(`Successfully generated ${embedRes.embeddings.float.length} embeddings for text file: ${fileName}`);
        return embedRes.embeddings.float;

    } catch (error: any) {
        console.error(`Error generating text embeddings for file ${fileName}:`, error);
        throw new Error(`Failed to generate text embeddings for file ${fileName}. Reason: ${error.message || error}`);
    }
}

export async function getQueryEmbedddings(query: string){
    const embedRes =  await cohere.embed({
        model: "embed-multilingual-v3.0",
        texts: [query],
        inputType: "search_query",
        embeddingTypes: ["float"],
    });

    return embedRes.embeddings.float ? embedRes.embeddings.float[0] : undefined;
}