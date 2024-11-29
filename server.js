import express from 'express';
import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv'

dotenv.config()

const app = express();
const PORT = process.env.PORT;



//Middleware para processar json
app.use(express.json());

const mongoURI = process.env.STRING_CONEXAO ;


const databaseName = process.env.DB_NAME;

let db;

async function connectToDatabase () {
    const client = new MongoClient(mongoURI);
    try {
        await client.connect()

        db = client.db(databaseName);

        console.log(`Conectado ao banco de dados: ${databaseName}`)
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error.mensage)
        process.exit(1);
    }
}

app.listen(PORT, async () => {
    console.log('servidor escutando')
    await connectToDatabase()
});



// 1 - Buscar todos os carros
app.get('/carros', async (req, res) => {
    try {
        const carros = await db.collection('carros').find({}).toArray(); // Busca todos os documentos
        res.json(carros); // Retorna os documentos encontrados
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veículo.' });
    }
});



app.get('/carros/:id', async (req, res) => {
    try {
        const carroId = req.params.id; // ID do carro vindo da URL

        // Verifica se o ID fornecido é válido
        if (!ObjectId.isValid(carroId)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        // Busca o documento no banco
        const carro = await db.collection('carros').findOne({ _id: new ObjectId(carroId) });

        // Caso o documento não seja encontrado
        if (!carro) {
            return res.status(404).json({ error: 'Carro não encontrado.' });
        }

        // Retorna o post encontrado
        res.json(carro);
    } catch (error) {
        console.error('Erro ao buscar carro:', error.message);
        res.status(500).json({ error: 'Erro ao buscar carro.' });
    }
});


// 3. Criar um item (CREATE)
app.post('/carros', async (req, res) => {
    try {
        const newItem = req.body; // Dados do item enviado no corpo da requisição
        const result = await db.collection('carros').insertOne(newItem); // Insere o documento
        res.status(201).json({ message: 'Item criado', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar item.' });
    }
});


app.put('/carros/:id', async (req, res) => {
    try {
        const carroId = req.params.id;
        const updates = req.body; // Dados a serem atualizados

        // Valida o ID
        if (!ObjectId.isValid(carroId)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        // Verifica se o corpo da requisição não está vazio
        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'Nenhum dado de atualização fornecido.' });
        }

        // Atualiza o documento
        const result = await db
            .collection('carros')
            .updateOne({ _id: new ObjectId(carroId) }, { $set: updates });

        // Verifica se o documento foi encontrado
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Carro não encontrado.' });
        }

        res.json({ message: 'Item atualizado com sucesso.' });
    } catch (error) {
        console.error('Erro ao atualizar post:', error.message);
        res.status(500).json({ error: 'Erro ao atualizar item.' });
    }
});


app.delete('/carros/:id', async (req, res) => {
    try {
        const carroId = req.params.id;

        // Verifica se o ID é válido
        if (!ObjectId.isValid(carroId)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        // Tenta remover o documento
        const result = await db.collection('carros').deleteOne({ _id: new ObjectId(carroId) });

        // Verifica se o documento foi encontrado e deletado
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Item não encontrado.' });
        }

        res.json({ message: 'Item deletado com sucesso.' });
    } catch (error) {
        console.error('Erro ao deletar item:', error.message);
        res.status(500).json({ error: 'Erro ao deletar item.' });
    }
});


