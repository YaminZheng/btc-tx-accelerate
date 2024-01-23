import { createApp } from "vue";
import App from "./App.vue";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";

bitcoin.initEccLib(ecc);
createApp(App).mount("#app");
