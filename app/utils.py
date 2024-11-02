import logging
import PyPDF2
from chromadb import HttpClient
from chromadb.utils import embedding_functions
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import DirectoryLoader
from langchain.schema import Document
import os
def chunk_text(documents, chunk_size, chunk_overlap):
    """Découpe les documents en morceaux de texte selon les paramètres spécifiés.

    Args:
        documents (list): Liste des documents à découper.
        chunk_size (int): Taille maximale de chaque morceau.
        chunk_overlap (int): Nombre de caractères à chevaucher entre les morceaux.

    Returns:
        list: Liste des morceaux de texte découpés.
    """
    # Crée le text splitter avec les paramètres spécifiés
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        add_start_index=True,
    )
    chunks = text_splitter.split_documents(documents)
    logging.info("Découpé %d documents en %d morceaux", len(documents), len(chunks))
    return chunks

def load_documents_from_folder(folder_path, chunk_size=512):
    """Charge les fichiers .txt depuis un dossier et les découpe en morceaux.

    Args:
        folder_path (str): Chemin du dossier contenant les fichiers texte.
        chunk_size (int): Taille des morceaux de texte.

    Returns:
        list: Liste des morceaux de texte découpés.
    """
    try:
        loader = DirectoryLoader(folder_path, glob="*.txt")
        documents = loader.load()
        # Découpe les documents en morceaux
        documents = chunk_text(documents, chunk_size, 50)

        # Log l'information sur le dixième document pour avoir un aperçu 
        if len(documents) > 1:  # Vérifie qu'il y a au moins 10 documents
            logging.info("Contenu du 1ème document: %s", documents[1].page_content)
            logging.info("Métadonnées du 1ème document: %s", documents[1].metadata)
        
        return documents

    except Exception as e:
        logging.error("Erreur lors du chargement des documents: %s", str(e))
        return []
    



def process_pdf(file):
    """Extrait le texte d'un fichier PDF et le découpe en morceaux."""
    pdf_reader = PyPDF2.PdfReader(file)
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text() + '\n'
    logging.info("Texte extrait du PDF.")

    # Crée une liste de documents à partir du texte extrait
    documents = [Document(page_content=text, metadata={'filename': file.filename})]
    documents = chunk_text(documents, chunk_size=512, chunk_overlap=50)
    return documents




def insert_to_chroma(documents, client):
    """Insère les documents dans la base de données Chroma."""
    embeddings_model = embedding_functions.OpenAIEmbeddingFunction(model_name="text-embedding-3-small", api_key=os.getenv('OPENAI_API_KEY'))
    collection = client.get_or_create_collection(name="Documents", embedding_function=embeddings_model)
    
    for i, doc in enumerate(documents):
        doc_id = f"{doc.metadata.get('filename')}_{i}"
        collection.add(
            documents=[doc.page_content],
            metadatas=[doc.metadata],
            ids=[doc_id]
        )

    logging.info("Sauvegardé %d morceaux dans la base de données", len(documents))
