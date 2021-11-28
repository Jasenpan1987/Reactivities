import { useLocation } from "react-router";

export default function useQueryString() {
  return new URLSearchParams(useLocation().search);
}
