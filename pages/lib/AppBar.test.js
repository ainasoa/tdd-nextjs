import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import AppBar from "./AppBar"

jest.mock('next-auth/react', () => ({
    signIn: jest.fn(),
    signOut: jest.fn(),
    useSession: jest.fn().mockReturnValue({ data: null })
}))

describe('authentication', () => {
    it('should signed in', () => {
        render(<AppBar />)

        const signIn = screen.getByRole('button', { name: /se connecter/i })

        expect(signIn).toBeInTheDocument()
        fireEvent.click(signIn)

        waitFor(() => {
            expect(screen.queryByTestId('user-info')).toBeInTheDocument()
            expect(screen.queryByTestId('user-info')).not.toHaveTextContent('')
        })

    })
})