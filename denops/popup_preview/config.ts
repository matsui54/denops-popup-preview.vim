export type Config = {
  border: boolean;
  maxWidth: number;
  maxHeight: number;
  winblend?: number;
  supportVsnip: boolean;
  supportInfo: boolean;
  supportUltisnips: boolean;
  delay: number;
  debug: boolean;
};

export function getDefaultDocConfig(): Config {
  return {
    border: true,
    maxWidth: 80,
    maxHeight: 30,
    supportVsnip: true,
    supportInfo: true,
    supportUltisnips: true,
    delay: 50,
    debug: false,
  };
}

export function makeConfig(userConfig: Config): Config {
  const config: Config = getDefaultDocConfig();
  if (userConfig) {
    Object.assign(config, userConfig);
  }
  return config;
}
