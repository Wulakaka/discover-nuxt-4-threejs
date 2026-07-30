import type {Inspector} from "three/examples/jsm/inspector/Inspector.js";

import type {InjectionKey} from "vue";

export const INSPECTOR_KEY: InjectionKey<Inspector> = Symbol("INSPECTOR_KEY");
