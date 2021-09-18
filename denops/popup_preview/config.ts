import { Border } from "./types.ts";

export type Config = {
  documentation: DocConfig;
  signature: SignatureConfig;
};

export type CommonConfig = {
  enable: boolean;
  border: Border;
  maxWidth: number;
  maxHeight: number;
  winblend?: number;
};

export type DocConfig = CommonConfig & {
  supportVsnip: boolean;
  supportInfo: boolean;
  supportUltisnips: boolean;
  delay: number;
};

export type SignatureConfig = CommonConfig & {};

export function getDefaultDocConfig(): DocConfig {
  return {
    enable: true,
    border: "single",
    maxWidth: 80,
    maxHeight: 30,
    supportVsnip: true,
    supportInfo: true,
    supportUltisnips: true,
    delay: 30,
  };
}

export function getDefaultSignatureConfig(): SignatureConfig {
  return {
    enable: true,
    border: "single",
    maxWidth: 80,
    maxHeight: 10,
  };
}

export function makeConfig(userConfig: Config): Config {
  const docConfig = getDefaultDocConfig();
  const sigConfig = getDefaultSignatureConfig();
  if (userConfig.signature) {
    Object.assign(sigConfig, userConfig.signature);
  }
  if (userConfig.documentation) {
    Object.assign(docConfig, userConfig.documentation);
  }
  return { documentation: docConfig, signature: sigConfig };
}
