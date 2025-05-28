import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import CommentMain from "../CommentMain.tsx";
import COMMENT_QUERY from "../../../graphql/commentQuery.ts";
import CREATE_COMMENT_MUTATION from "../../../graphql/createCommentMutation";
import { PrivilegesContext } from "../../../context/PrivilegesContext";
import '@testing-library/jest-dom';


const mocks = [
  {
    request: {
      query: CREATE_COMMENT_MUTATION,
      variables: {
        publication: 1,
        text: "Test comment",
      },
    },
    result: {
      data: {
        createComment: {
          success: true,
        },
      },
    },
  },
  {
    request: {
      query: COMMENT_QUERY,
      variables: {
        publicationId: 1,
      },
    },
    result: {
      data: {
        commentsByPublication: [],
      },
    },
  },
];

describe("CommentMain", () => {
  it("submits a comment successfully", async () => {
    const handleSubmit = jest.fn();
    const handleError = jest.fn();
    const handleReport = jest.fn();

    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <PrivilegesContext.Provider value={{ privileges: { isLoggedIn: true } }}>
          <CommentMain
            publicationId={1}
            onSubmit={handleSubmit}
            onError={handleError}
            onReportComment={handleReport}
          />
        </PrivilegesContext.Provider>
      </MockedProvider>
    );

    // Wait for query to resolve
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Write comment")).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText("Write comment");
    const button = screen.getByText("Comment");

    fireEvent.change(textarea, { target: { value: "Test comment" } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("Comment submitted successfully");
    });

    expect(textarea).toHaveValue(""); // Le champ devrait être vidé après soumission
  });
});
