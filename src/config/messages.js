const ERROR_REQUIRED_FIELDS = {
  status: false,
  status_code: 400,
  error: 'missing_fields',
  message: 'Existem campos obrigatórios não preenchidos.',
}

const ERROR_INVALID_ID = {
  status: false,
  status_code: 400,
  error: 'invalid_id',
  message: 'O id informado é inválido.',
}

const ERROR_CONTENT_TYPE = {
  status: false,
  status_code: 415,
  error: 'invalid_content_type',
  message: 'Você deve encaminhar apenas JSON.',
}

const ERROR_UNAUTHORIZED = {
  status: false,
  status_code: 401,
  error: 'unauthorized',
  message: 'Não autorizado.',
}

const ERROR_FORBIDDEN = {
  status: false,
  status_code: 403,
  error: 'forbidden',
  message: 'Ação não permitida.',
}

const ERROR_NOT_FOUND = {
  status: false,
  status_code: 404,
  error: 'not_found',
  message: 'Não foram encontrados itens para retorno.',
}

const ERROR_CONFLICT = {
  status: false,
  status_code: 409,
  error: 'conflict',
  message: 'Conflito de dados.',
}

const ERROR_INTERNAL_SERVER = {
  status: false,
  status_code: 500,
  error: 'internal_error',
  message: 'Erro interno no servidor.',
}

const SUCCESS_CREATED_ITEM = {
  status: true,
  status_code: 201,
  message: 'Item criado com sucesso.',
}

const SUCCESS_UPDATED_ITEM = {
  status: true,
  status_code: 200,
  message: 'Item atualizado com sucesso.',
}

const SUCCESS_DELETED_ITEM = {
  status: true,
  status_code: 200,
  message: 'Item excluído com sucesso.',
}

module.exports = {
  ERROR_REQUIRED_FIELDS,
  ERROR_INVALID_ID,
  ERROR_CONTENT_TYPE,
  ERROR_UNAUTHORIZED,
  ERROR_FORBIDDEN,
  ERROR_NOT_FOUND,
  ERROR_CONFLICT,
  ERROR_INTERNAL_SERVER,
  SUCCESS_CREATED_ITEM,
  SUCCESS_UPDATED_ITEM,
  SUCCESS_DELETED_ITEM,
}
