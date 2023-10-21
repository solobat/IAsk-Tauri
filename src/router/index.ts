import Vue from "vue";
import { createRouter, RouteRecordRaw, createWebHistory } from "vue-router";
import Note from "../views/Note.vue";
import Dashboard from "../views/Dashboard.vue";
import Review from "../views/Review.vue";
import store from "../store";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/review",
    name: "Review",
    component: Review,
  },
  {
    path: "/note",
    name: "Note",
    component: Note,
    beforeEnter(to, from, next) {
      store.commit("SET_AID", Number(to.query.aid));
      next();
    },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
