import type { Route } from "./+types/home";
import CounterForm from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Kube Counter - CKAD" },
    { name: "description", content: "a ckad project" },
  ];
}

export default function Home() {
  return <CounterForm />;
}
