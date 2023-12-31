const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');

// Rota para buscar pagamentos (GET)
router.get('/:id', pagamentoController.buscarPagamentoPorId);

// Rota para realizar pagamento (POST)
router.post('/pagar', pagamentoController.realizarPagamento);

module.exports = router;