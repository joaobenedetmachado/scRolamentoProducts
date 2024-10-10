from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient

minhaSenha = '123'
client = MongoClient(f"mongodb+srv://joaoteste:{minhaSenha}@iotcluster.a70ey.mongodb.net/?retryWrites=true&w=majority&appName=IotCluster")
db = client["scrolamentos"]
collection = db["scrolamentoscollection"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Documento(BaseModel):
    id: str  # Adicione o ID ao modelo para facilitar a atualização
    nome: str
    peso: float  
    preco: float  

@app.get("/documentos")
async def lerDocumentos():
    documentos = []
    cursor = collection.find({})
    for documento in cursor:
        documento['_id'] = str(documento['_id'])  
        documentos.append(documento)
    return {"documentos": documentos}

@app.post("/documentos")
async def inserirDocumentos(documento: Documento):
    novo_documento = documento.dict()
    resultado = collection.insert_one(novo_documento)
    return {"message": "Documento inserido", "id": str(resultado.inserted_id)}

@app.put("/documentos/update")  # Rota para atualizar um documento
async def atualizarDocumento(documento: Documento):
    # Convertendo o ID recebido para um ObjectId
    resultado = collection.update_one(
        {"_id": documento.id},  # Filtra o documento pelo ID
        {"$set": {
            "nome": documento.nome,
            "peso": documento.peso,
            "preco": documento.preco,
        }}
    )

    if resultado.matched_count == 0:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    
    return {"message": "Documento atualizado com sucesso"}

