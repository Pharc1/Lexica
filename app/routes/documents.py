from flask import Blueprint, jsonify, render_template, request
import PyPDF2
import logging
import os
from utils import process_pdf, insert_to_chroma
import chromadb
documents = Blueprint('documents', __name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chroma_host = os.getenv('CHROMA_DB_HOST', 'https://chroma-482049242144.us-central1.run.app')  
chroma_port = os.getenv('CHROMA_DB_PORT', 8000) 
chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port)

@documents.route("/file", methods=["POST"])
def file():
    if 'file' not in request.files:
        logger.warning("Aucun fichier trouvé dans la requête.")
        return "Aucun fichier trouvé", 400

    file = request.files['file']

    if file.filename == '':
        logger.warning("Aucun fichier sélectionné.")
        return "Aucun fichier sélectionné", 400

    logger.info(f"Nom du fichier : {file.filename}")

    # Traitement du PDF
    try:
        documents = process_pdf(file)
        
        insert_to_chroma(documents, chroma_client)

    except Exception as e:
        logger.error("Erreur lors du traitement du fichier PDF : %s", str(e))
        return f"Erreur lors du traitement du fichier PDF : {str(e)}", 500

    return render_template('index.html')  # Renvoie à la page d'index