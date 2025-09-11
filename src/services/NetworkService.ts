export interface NetworkState {
  isConnected: boolean;
  type: string | null;
  isInternetReachable: boolean | null;
}

export class NetworkService {
  private static instance: NetworkService;
  private currentState: NetworkState | null = null;

  private constructor() {
    this.initializeNetworkListener();
  }

  static getInstance(): NetworkService {
    if (!NetworkService.instance) {
      NetworkService.instance = new NetworkService();
    }
    return NetworkService.instance;
  }

  private async initializeNetworkListener() {
    try {
      // 간단한 네트워크 연결 확인
      const isConnected = await this.checkInternetConnectivity();
      this.currentState = {
        isConnected,
        type: 'unknown',
        isInternetReachable: isConnected,
      };
    } catch (error) {
      console.error('네트워크 상태 초기화 오류:', error);
      this.currentState = {
        isConnected: false,
        type: null,
        isInternetReachable: false,
      };
    }
  }

  async getNetworkState(): Promise<NetworkState> {
    if (!this.currentState) {
      try {
        const isConnected = await this.checkInternetConnectivity();
        this.currentState = {
          isConnected,
          type: 'unknown',
          isInternetReachable: isConnected,
        };
      } catch (error) {
        console.error('네트워크 상태 조회 오류:', error);
        this.currentState = {
          isConnected: false,
          type: null,
          isInternetReachable: false,
        };
      }
    }
    return this.currentState;
  }

  isConnected(): boolean {
    return this.currentState?.isConnected ?? false;
  }

  isInternetReachable(): boolean {
    return this.currentState?.isInternetReachable ?? false;
  }

  getConnectionType(): string | null {
    return this.currentState?.type ?? null;
  }

  async checkInternetConnectivity(): Promise<boolean> {
    try {
      // 간단한 네트워크 연결 확인을 위해 fetch를 사용
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      console.log('네트워크 연결 확인 실패:', error);
      return false;
    }
  }
}
