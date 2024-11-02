import os
import logging
import chromadb
from chromadb.config import Settings
from chromadb.utils import embedding_functions
from utils import load_documents_from_folder

# Configure logging
logging.basicConfig(level=logging.INFO)

client = chromadb.HttpClient(host='https://chroma-482049242144.us-central1.run.app', port=8000)
logging.info("heartbeat %d", client.heartbeat())


# Charger les documents et découper en morceaux
folder_path = 'app/static/documents'
documents = load_documents_from_folder(folder_path)


# Création d'une fonction d'embedding
embeddings_model = embedding_functions.OpenAIEmbeddingFunction(model_name="text-embedding-3-small", api_key=os.getenv('OPENAI_API_KEY'))

# Création d'une collection pour stocker les documents
collection = client.get_or_create_collection(name ="Documents", embedding_function=embeddings_model)

# Ajouter les documents avec leurs embeddings
try:
    for i, doc in enumerate(documents):
        # Génération d'un ID unique pour chaque document
        doc_id = f"doc_{i}"
        
        # Ajoutez le document à la collection
        collection.add(
            documents=[doc.page_content],
            metadatas=[doc.metadata],
            ids=[doc_id]
        )

    # Persister la base de données
    logging.info("Sauvegardé %d morceaux dans la base de donnée", len(documents))

except Exception as e:
    logging.error("Erreur lors de l'initialisation de Chroma: %s", str(e))

results = collection.query(
    query_texts=["This is a query document about hawaii"], # Chroma will embed this for you
    n_results=3 # how many results to return
)

context = "/n/n----/n/n".join(doc for doc  in results['documents'][0])
print("context:",context)
print("results:", results)
