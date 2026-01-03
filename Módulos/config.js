/* MENSAGENS DE ERRO */ 

const ERROR_REQUIRED_FIELDS = {status: false, status_code: 400, message: 'Existem campos obrigatórios não preenchidos'}

const ERROR_INTERNAL_SERVER_CONTROLLER = {status: false, status_code: 500, message: 'Devido a um erro interno no servidor de controle de dados (controller), não foi possível processar a requisição.'}

const ERROR_INTERNAL_SERVER_MODEL = {status: false, status_code: 500, message: 'Devido a um erro interno no servidor de modelagem de dados, não foi possível processar a requisição.'}

const ERROR_CONTENT_TYPE = {status: false, status_code: 415, message: 'Não foi possível processar a requisição, pois os tipos de dados encaminhados não são aceitos na API. Você deve encaminhar apenas JSON.'}

const ERROR_NOT_FOUND = {status: false, status_code: 404, message: 'Não foram encontrados itens para retorno.'}

/* MENSAGENS DE SUCESSO */


const SUCCESS_CREATED_ITEM = {status: true, status_code: 201, message: 'Item criado com sucesso.'}

const SUCCESS_DELETED_ITEM = {status: true, status_code: 200, message: 'Item deletado com HAXIXE.'}

const SUCCESS_UPDATED_ITEM = {status: true, status_code: 200, message: 'Item atualizado com sucesso.'}

module.exports = {
    ERROR_REQUIRED_FIELDS,
    ERROR_CONTENT_TYPE,
    ERROR_INTERNAL_SERVER_CONTROLLER,
    ERROR_INTERNAL_SERVER_MODEL,
    ERROR_NOT_FOUND,
    SUCCESS_CREATED_ITEM,
    SUCCESS_DELETED_ITEM,
    SUCCESS_UPDATED_ITEM
}