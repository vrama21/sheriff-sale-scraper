import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults } from 'axios';

export interface CreateHttpClientConfig extends CreateAxiosDefaults {
  authToken?: string;
}

/**
 * A reusable class used to perform HTTP CRUD operations.
 *
 * @example
 * ```typescript
 * const api = new HttpClient({ baseURL: '/api/v1' });
 * api.setToken('token');
 *
 * const postData = {};
 * const response = await api.post('/someUrl', postData);
 * ```
 */
export class HttpClient {
  protected axiosInstance: AxiosInstance;

  private token: string;

  /**
   * Creates an instance of HttpClient.
   * @param {CreateHttpClientConfig} config
   */
  public constructor(config: CreateHttpClientConfig) {
    this.axiosInstance = axios.create(config);

    this.token = config.authToken || '';

    this.axiosInstance.interceptors.request.use(
      (req) => {
        if (req.headers) {
          req.headers['Authorization'] = `Bearer ${this.getToken()}`;
        }

        return req;
      },
      (error) => {
        throw error;
      },
    );

    this.axiosInstance.interceptors.response.use(
      (param) => ({
        ...param,
      }),
      (error: AxiosError) => {
        delete error.config?.headers['Authorization'];
        delete error.request['_header'];

        throw error;
      },
    );
  }

  /**
   * Gets Authorization Token.
   *
   * @returns {string} authorization token
   * @memberof HttpClient
   */
  public getToken(): string {
    return this.token;
  }

  /**
   * Sets Authorization Token.
   *
   * @param {string} token authorization token.
   * @memberof HttpClient
   */
  public setToken(token: string): void {
    this.token = token;
  }

  /**
   * Get Uri
   *
   * @access
   * @param {AxiosRequestConfig} config the request config
   * @returns {string}
   * @memberof HttpClient
   */
  public getUri(config?: AxiosRequestConfig): string {
    return this.axiosInstance.getUri(config);
  }

  /**
   * Generic request.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template R the expected object inside an axios response format
   * @param {import("axios").AxiosRequestConfig} [config] - axios request configuration.
   * @returns {Promise<R>} - HTTP axios response payload.
   * @memberof HttpClient
   *
   * @example
   * ```typescript
   * const response: AxiosResponse<User> = await api.request<User>({
   *   method: "GET|POST|DELETE|PUT|PATCH"
   *   baseUrl: "http://www.domain.com",
   *   url: "/api/v1/users",
   *   headers: {
   *     "Content-Type": "application/json"
   *  }
   * });
   * ```
   */
  public async request<T, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.request(config);
  }

  /**
   * HTTP GET method
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {AxiosRequestConfig} config axios request configuration.
   * @returns {Promise<R>} HTTP axios response payload.
   * @memberof HttpClient
   */
  public async get<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.get(url, config);
  }

  /**
   * HTTP OPTIONS method.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {AxiosRequestConfig} config axios request configuration
   * @returns {Promise<R>} HTTP axios response payload.
   * @memberof HttpClient
   */
  public async options<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.options(url, config);
  }

  /**
   * HTTP DELETE method.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {AxiosRequestConfig} config axios request configuration
   * @returns {Promise<R>} HTTP axios response payload
   * @memberof HttpClient
   */
  public async delete<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.delete(url, config);
  }
  /**
   * HTTP HEAD method.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {AxiosRequestConfig} config axios request configuration
   * @returns {Promise<R>} HTTP axios response payload
   * @memberof HttpClient
   */
  public async head<T, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.head(url, config);
  }

  /**
   * HTTP POST method.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template B the expected type of body request object
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {B} data payload to be send as the request body
   * @param {AxiosRequestConfig} [config] axios request configuration
   * @returns {Promise<R>} HTTP axios response payload
   * @memberof HttpClient
   */
  public async post<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.post(url, data, config);
  }

  /**
   * HTTP PUT method.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template B the expected type of body request object
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {B} data payload to be send as the request body
   * @param {AxiosRequestConfig} config axios request configuration
   * @returns {Promise<R>} - HTTP axios response payload
   * @memberof HttpClient
   */
  public async put<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.put(url, data, config);
  }

  /**
   * HTTP PATCH method.
   *
   * @async
   * @access public
   * @template T the expected type of the data payload in the axios response
   * @template B the expected type of body request object
   * @template R the expected object inside an axios response format
   * @param {string} url endpoint you want to reach
   * @param {B} data payload to be send as the request body
   * @param {AxiosRequestConfig} config axios request configuration
   * @returns {Promise<R>} HTTP axios response payload
   * @memberof HttpClient
   */
  public async patch<T, B, R = AxiosResponse<T>>(url: string, data?: B, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.patch(url, data, config);
  }
}
