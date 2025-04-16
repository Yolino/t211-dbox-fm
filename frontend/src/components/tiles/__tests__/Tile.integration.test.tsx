import React from "react";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MockedProvider } from "@apollo/client/testing";
import { BrowserRouter } from "react-router-dom";
import Tile from "../Tile.tsx";
import AudioPlayer from "../../AudioPlayer.tsx";
import CREATE_VOTE_MUTATION from "../../../graphql/createVoteMutation.ts";
import UPDATE_VOTE_MUTATION from "../../../graphql/updateVoteMutation.ts";
import DELETE_VOTE_MUTATION from "../../../graphql/deleteVoteMutation.ts";
import TileGroup from "../TileGroup.tsx";

const mockNavigate = jest.fn();
jest.mock('react-router-dom');

jest.mock("../../../svg/AudioIcon.tsx", () => {
  return {
    __esModule: true,
    default: ({ styleClass, testId }) => (
      <svg 
        data-testid={testId || "audio-icon"} 
        className={styleClass}
        viewBox="0 0 24 24"
      >
        <rect width="24" height="24" />
      </svg>
    )
  };
});

jest.mock("../../../svg/PlayIcon.tsx", () => ({
  __esModule: true,
  default: () => <svg data-testid="play-icon" />
}));

jest.mock("../../../svg/UpvoteIcon.tsx", () => ({
  __esModule: true,
  default: () => <svg data-testid="upvote-icon" />
}));

jest.mock("../../../svg/DownvoteIcon.tsx", () => ({
  __esModule: true,
  default: () => <svg data-testid="downvote-icon" />
}));


const mockPublications = [
  {
    id: 1,
    title: "Audio Publication",
    cover: null,
    voteCount: 10,
    visitorVote: 0,
    author: { username: "audioCreator" },
  },
  {
    id: 2,
    title: "Image Publication",
    cover: "/images/cover.jpg",
    voteCount: 20,
    visitorVote: 1,
    author: { username: "imageCreator" },
  }
];

const createVoteMock = {
  request: {
    query: CREATE_VOTE_MUTATION,
    variables: { publicationId: 1, voteType: 1 },
  },
  result: {
    data: {
      createVote: {
        voteCount: 11,
      },
    },
  },
};

const renderTileList = (mocks = []) => {
  const onPlayAudio = jest.fn();
  const onTileClick = jest.fn();
  const onTileVote = jest.fn();
  const onError = jest.fn();
  
  return {
    ...render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <BrowserRouter>
          <div data-testid="parent-container">
            {mockPublications.map(pub => (
              <Tile
                key={pub.id}
                publication={pub}
                group="test-group"
                onPlayAudio={onPlayAudio}
                onTileClick={onTileClick}
                onTileVote={onTileVote}
                onError={onError}
              />
            ))}
            <div data-testid="audio-player-mock">
              Current Track: <span data-testid="current-track">None</span>
            </div>
          </div>
        </BrowserRouter>
      </MockedProvider>
    ),
    handlers: {
      onPlayAudio,
      onTileClick,
      onTileVote,
      onError
    }
  };
};

const hoverOverTile = (tileTitle) => {
  const tile = screen.getByText(tileTitle).closest(".group");
  fireEvent.mouseOver(tile);
  return tile;
};

describe("Tile Component Integration", () => {
  it("renders AudioIcon properly for publications without cover", () => {
    renderTileList();
    
    const audioIconTile = screen.getByText("Audio Publication").closest(".group");
    expect(within(audioIconTile).getByTestId("audio-icon")).toBeInTheDocument();
    expect(within(audioIconTile).getByTestId("audio-icon")).toHaveClass("w-12 h-12 text-gray-800");
  });
  
  it("does not render AudioIcon for publications with cover", () => {
    renderTileList();
    const imageTile = screen.getByText("Image Publication").closest(".group");
    expect(within(imageTile).queryByTestId("audio-icon")).not.toBeInTheDocument();
    expect(within(imageTile).getByAltText("Cover for Image Publication")).toBeInTheDocument();
  });
  
  it("triggers audio playback when play button is clicked", () => {
    const { handlers } = renderTileList();
    const audioTile = hoverOverTile("Audio Publication");
    const playButton = within(audioTile).getByRole("button", { name: /play audio/i });
    fireEvent.click(playButton);
    expect(handlers.onPlayAudio).toHaveBeenCalledWith({
      id: 1,
      title: "Audio Publication",
      author: "audioCreator",
    });
  });
  
  it("navigates to author profile when username is clicked", () => {
    renderTileList();
    const usernameElement = screen.getByText("audioCreator");
    fireEvent.click(usernameElement);
    expect(mockNavigate).toHaveBeenCalledWith("/profile/audioCreator");
  });
  
  it("integrates with voting API when upvote is clicked", async () => {
    const { handlers } = renderTileList([createVoteMock]);
    const audioTile = hoverOverTile("Audio Publication");
    const upvoteButton = within(audioTile).getByRole("button", { name: /upvote/i });
    fireEvent.click(upvoteButton);
    await waitFor(() => {
      expect(handlers.onTileVote).toHaveBeenCalled();
    });
  });
  
  it("handles conditional rendering based on properties", () => {
    renderTileList();
    const upvotedTile = screen.getByText("Image Publication").closest(".group");
    const upvoteButton = within(upvotedTile).getByRole("button", { name: /upvote/i });
    expect(upvoteButton).toHaveClass("bg-green-300");
  });
  
  it("propagates errors from GraphQL mutations", async () => {
    const errorMock = {
      request: {
        query: CREATE_VOTE_MUTATION,
        variables: { publicationId: 1, voteType: 1 },
      },
      error: new Error("API Error"),
    };
    
    const { handlers } = renderTileList([errorMock]);
    const audioTile = hoverOverTile("Audio Publication");
    const upvoteButton = within(audioTile).getByRole("button", { name: /upvote/i });
    fireEvent.click(upvoteButton);
    await waitFor(() => {
      expect(handlers.onError).toHaveBeenCalledWith("API Error");
    });
  });
  
  it("handles a sequence of user interactions correctly", async () => {
    const mocks = [
      createVoteMock,
      {
        request: {
          query: DELETE_VOTE_MUTATION,
          variables: { publicationId: 1 },
        },
        result: {
          data: {
            deleteVote: {
              voteCount: 10,
            },
          },
        },
      }
    ];
    
    const { handlers } = renderTileList(mocks);
    const audioTile = hoverOverTile("Audio Publication");
    const playButton = within(audioTile).getByRole("button", { name: /play audio/i });
    fireEvent.click(playButton);
    expect(handlers.onPlayAudio).toHaveBeenCalled();
    const upvoteButton = within(audioTile).getByRole("button", { name: /upvote/i });
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(handlers.onTileVote).toHaveBeenCalled();
    });
    jest.clearAllMocks();
    
    const updatedPublication = {
      ...mockPublications[0],
      visitorVote: 1,
      voteCount: 11
    };
    
    fireEvent.click(audioTile);
    expect(handlers.onTileClick).toHaveBeenCalledWith(1, "test-group");
  });
});

function within(element) {
  return {
    getByTestId: (testId) => {
      const results = Array.from(element.querySelectorAll(`[data-testid="${testId}"]`));
      if (results.length === 0) throw new Error(`Could not find test id: ${testId}`);
      return results[0];
    },
    getByRole: (role, options) => {
      const results = Array.from(element.querySelectorAll(`[role="${role}"]`));
      if (options && options.name) {
        const filtered = results.filter(el => 
          el.getAttribute('aria-label')?.toLowerCase().includes(options.name.toLowerCase().replace(/[\/\\^$*+?.()|[\]{}]/g, ''))
        );
        if (filtered.length === 0) throw new Error(`Could not find element with role: ${role} and name: ${options.name}`);
        return filtered[0];
      }
      if (results.length === 0) throw new Error(`Could not find element with role: ${role}`);
      return results[0];
    },
    getByText: (text) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.includes(text)) {
          return node.parentElement;
        }
      }
      throw new Error(`Could not find text: ${text}`);
    },
    getByAltText: (alt) => {
      const results = Array.from(element.querySelectorAll(`[alt="${alt}"]`));
      if (results.length === 0) throw new Error(`Could not find element with alt text: ${alt}`);
      return results[0];
    },
    queryByTestId: (testId) => {
      const results = Array.from(element.querySelectorAll(`[data-testid="${testId}"]`));
      return results.length > 0 ? results[0] : null;
    }
  };
}
