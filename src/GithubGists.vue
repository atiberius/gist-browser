<template>
  <form @submit.prevent="getGists">
    <div id="searchForm">
    <div id="githubToken" v-if="githubToken">
      <p>Using GitHub token</p>
    </div>
    <div id="searchBar">
      <input placeholder="Github username" v-model="username" type="text" id="username"/>
      <button type="submit">Search</button>
    </div>
    <div id="pendingMessage" v-if="pendingRequest">
      <p>Searching...</p>
    </div>
    <div id="errMessage" v-else-if="errMessage" v-html="errMessage"></div>
    <div id="result" v-else-if="user">
      <div id="generalInfo">
        <img id="userAvatar" :src="user.avatar_url" alt="user.name"/>
        <div v-if="user.name">
          <div id="userFullname">{{ user.name }}</div>
          <div id="usernameBio">{{ username }}</div>
        </div>
        <div v-if="user.bio">
          <div>{{ user.bio }}</div>
        </div>
      </div>
      <div id="gists">
        <div v-if="gists.length > 0">
          <div id="gistsTitle">Public gists:</div>
          <AccordionList id="gistsAccordion" open-multiple-items>

            <AccordionItem v-for="gist in gists" :key="gist.id" default-opened>
              <template #summary>
                <span class="gistTitle" :title="gist.description">
                  <span>{{ gist.title }}</span>
                  <span class="timeago" :title="gist.createdDateFriendly">Created {{gist.timeAgo}}</span>
                </span>
              </template>
              <div v-if="gist.forks.length > 0" class="forkedBy">
                <div class="forkedByTitle">Forked by:</div>
                <div class="forkedByList">
                  <div v-for="fork in gist.forks" :key="fork.owner.login" class="forkedByUser">
                    <img :src="fork.owner.avatar_url" class="forkedByAvatar" alt="User avatar"/> <span>{{ fork.owner.login }}</span>
                  </div>
                </div>
              </div>
              <p class="filesTitle">Files:</p>
              <AccordionList id="gistFilesAccordion" open-multiple-items>
                <AccordionItem v-for="(file, , idx) in gist.files" :key="file.filename" @click="loadGistFiles(gist.id)">
                    <template #summary :class="headerExpandFile">
                      <span>{{idx + 1}}. {{ file.filename }}</span>
                      <span :class="'badge badge-' + file.language.toLowerCase()" v-if="file.language">{{ file.language }}</span>
                    </template>
                  <div v-if="gistFileContents[gist.id]">
                    <highlightjs autodetect :code="gistFileContents[gist.id][file.filename]" id="codeHighlight" v-if="gistFileContents[gist.id][file.filename]"/>
                  </div>
                  <div v-else>
                    <p>Loading {{file.filename}}...</p>
                  </div>
                </AccordionItem>
              </AccordionList>
            </AccordionItem>
          </AccordionList>
        </div>
        <div id="gistsNotFound" v-if="gists.length === 0">No public gists found.</div>
      </div>
    </div>
  </div>
  </form>
</template>

<script>

import axios from 'axios';
import 'highlight.js/lib/common';
import hljsVuePlugin from "@highlightjs/vue-plugin";
import { AccordionList, AccordionItem } from "vue3-rich-accordion";
import TimeAgo from 'javascript-time-ago';
import DOMPurify from 'dompurify';


import "vue3-rich-accordion/accordion-library-styles.css";
import 'highlight.js/styles/default.css';

export default {
  components: {
    highlightjs: hljsVuePlugin.component,
    TimeAgo,
    AccordionList, AccordionItem
  },
  data() {
    return {
      username: '',
      filteredUsername: '',
      user: null,
      githubToken: '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',
      gists: [],
      currentFileIndex: 0,
      gistFileContents: [],
      pendingRequest: false,
      errMessage: null,
      timeAgoFormatter: new TimeAgo('en-US'),
    }
  },
  methods: {
    async getGists() {
      if (this.username.length > 0) {
        this.pendingRequest = true;
        this.errMessage = null;
        this.gists = [];
        this.gistFileContents = [];
        try {
          this.filteredUsername = DOMPurify.sanitize(this.username);
          const headers = this.githubToken ? { 'Authorization': `Token ${this.githubToken}` } : {}
          const {data: user} = await axios.get(`https://api.github.com/users/${this.filteredUsername}`, {headers});
          this.user = user;
        } catch (err) {
          if (err.hasOwnProperty('response')) {
            switch (err.response.status) {
              case 404:
                this.errMessage = `User ${this.filteredUsername} not found`;
                break;
              case 403:
                this.errMessage = `Access forbidden. Probably too many API requests in the last hour. Please try again later.`;
                break;
              default:
                this.errMessage = `There has been an error while reading information about user ${this.filteredUsername}:<br/>` + err.message;
                console.error(err);
            }
          }
          this.user = null;
        }
        finally {
          this.pendingRequest = false;
        }

        if (this.user != null) {
          this.pendingRequest = true;
          this.errMessage = null;
          try {
            const headers = this.githubToken ? { 'Authorization': `Token ${this.githubToken}` } : {}
            const {data: gists} = await axios.get(`https://api.github.com/users/${this.filteredUsername}/gists`,{headers});
            this.gists = gists;
            gists.forEach((gist, ) => {
              gist.title = gist.title ?gist.title : (gist.description ?gist.description.substring(0, 100) + (gist.description.length > 100 ?'...' :'') :'[No title]');
              gist.createdDateFriendly = new Date(gist.created_at);
              gist.timeAgo = this.timeAgoFormatter.format(gist.createdDateFriendly);
            })
            const forksPromises = gists.map(gist => axios.get(gist.forks_url,{headers}));
            const gistForks = await Promise.allSettled(forksPromises);

            gists.forEach((gist, index) => {
              gist.forks = gistForks[index].status === 'fulfilled' ?gistForks[index].value.data :[];
            });

          } catch (err) {
            this.errMessage = `There has been an error reading gists from user ${this.filteredUsername}<br/>` + err.message;
          }
          finally {
            this.pendingRequest = false;
          }
        }
      }
      else {
        this.user = null;
        this.gists = [];
        this.gistFileContents = [];
        this.errMessage = null;
      }
    },

    async loadGistFiles(id) {
      if (this.gistFileContents[id]) {
        return true;
      }
      else {
        try {
          const headers = this.githubToken ? { 'Authorization': `Token ${this.githubToken}` } : {}
          const {data} = await axios.get(`https://api.github.com/gists/${id}`, {headers});
          this.gistFileContents[id] = [];
          Object.entries(data.files).forEach(entry => {
            const [filename, details] = entry;
            this.gistFileContents[id][filename] = details['content'];
          });
        } catch (err) {
          this.gistFileContents[id] = [];
          alert(`There has been an error reading gist ${id}\r\n` + err.message);
          // console.error(err);
        }
      }
    },

  },
}
</script>

