import { logoutAction } from "@/app/actions/auth";

export function LogoutForm() {
  return (
    <form action={logoutAction} className="mt-6">
      <button
        type="submit"
        className="inline-flex rounded-full border border-white/10 px-4 py-3 text-sm font-semibold text-white/82 transition hover:bg-white/8"
      >
        Logout
      </button>
    </form>
  );
}
