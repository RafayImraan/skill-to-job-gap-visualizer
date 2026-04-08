import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthForm } from "@/components/auth-form";

const push = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    refresh,
  }),
  useSearchParams: () => ({
    get: () => "/dashboard",
  }),
}));

jest.mock("@/lib/api", () => ({
  login: jest.fn(() => Promise.resolve({ authenticated: true })),
  register: jest.fn(() => Promise.resolve({ authenticated: true })),
}));

describe("AuthForm", () => {
  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
  });

  it("submits sign-in credentials and redirects", async () => {
    render(<AuthForm mode="sign-in" />);

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/dashboard");
      expect(refresh).toHaveBeenCalled();
    });
  });

  it("renders sign-up mode fields", () => {
    render(<AuthForm mode="sign-up" />);

    expect(screen.getByText(/create your account/i)).toBeInTheDocument();
    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
  });
});
