// Entry point: create the store, connect the UI, draw the first frame.
import { createStore } from './state.js';
import { createRenderer } from './ui/render.js';

const store = createStore();
const render = createRenderer(document, store);

store.subscribe(render);
render(store.getState());
