import { createApp } from 'vue'
import GithubGists from './GithubGists.vue'

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

import './main.css'

const app = createApp(GithubGists)
app.mount('#app')
