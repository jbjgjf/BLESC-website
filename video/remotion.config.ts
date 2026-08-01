import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
// The compositions are flat colour and soft gradients, so quality survives a
// high CRF while keeping the asset small enough to sit in a web page.
Config.setCrf(20);
