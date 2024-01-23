class ServerError extends Error {
  result: any;
  response: Response;
  constructor(message: string, result: any, response: Response) {
    super(message);
    this.result = result;
    this.response = response;
  }
}

const parseResponse = async (response: Response) => {
  const result = await response.json();
  if (result.code !== 0) {
    throw new ServerError(result.message, result, response);
  }
  return result.data;
};

function jointURL(url: string, params: any) {
  const _url = new URL(url, window.origin);
  _url.search = new URLSearchParams(
    params ? JSON.parse(JSON.stringify(params)) : params
  ).toString();
  return _url;
}

type RequestArgs = RequestInit & { params?: any; isNoParse?: boolean };

class MyRequest {
  constructor() {}

  async get(url: string, { params, headers } = {} as RequestArgs) {
    const response = await fetch(jointURL(url, params), {
      method: "GET",
      headers,
    });
    return parseResponse(response);
  }

  async post(
    url: string,
    data: any,
    { headers, params, isNoParse } = {} as RequestArgs
  ) {
    const response = await fetch(jointURL(url, params), {
      method: "POST",
      body: JSON.stringify(data),
      headers,
    });
    return isNoParse ? response : parseResponse(response);
  }
}

export default new MyRequest();
