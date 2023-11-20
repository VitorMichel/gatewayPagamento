const { produce } = require('../kafka/payment');
const redis = require('../db/redis');
const topic = "payment-order";

module.exports = {
  buscarPagamentos: async (req, res) => {
    // Conectar ao Kafka
    await connectKafka();

    // Lógica para buscar pagamentos do Kafka

    // Desconectar do Kafka
    await disconnectKafka();

    res.json(pagamentos);
  },

  realizarPagamento: async (req, res) => {
    const { valor, descricao } = req.body;

    // Valida se valor e descrição foram enviados
    if (!valor || !descricao) {
      return res.status(400).json({ mensagem: 'Valor e descrição são obrigatórios.' });
    }

    let id = await redis.get("payment_id");

    if (id) {
      id = parseInt(id) + 1;
    } else {
      id = 1;
    }
    await redis.set("payment_id", id);

    // Cria objeto de pagamento
    const pagamento = {
      id: id,
      end_to_end_id: generateId(),
      status: 'processing',
      valor,
      descricao,
    };

    // Salva pagamento no Redis
    const teste = await redis.set("pix::" + pagamento.id, JSON.stringify(pagamento));

    // Verifica se pagamento foi salvo
    if (teste !== 'OK') {
      return res.status(500).json({ mensagem: 'Erro ao salvar pagamento.' });
    }

    // Envia pagamento para tópico do Kafka
    await produce(topic, JSON.stringify(pagamento));

    res.status(201).json(pagamento);
  },
};

const generateId = () => {
  const prefix = "E";
  const sequenceNumber = "00000000";
  const dateTime = new Date().toISOString().replace(/[^0-9]/g, "").substring(0, 12);
  const randomString = Math.random().toString(36).substring(2, 15);

  return prefix + sequenceNumber + dateTime + randomString;
}