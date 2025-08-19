import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import RoleBadge from "../role-badge"

describe("RoleBadge", () => {
  it("renders Patient", () => {
    render(<RoleBadge role="patient" />)
    expect(screen.getByText("Patient")).toBeInTheDocument()
  })
})
