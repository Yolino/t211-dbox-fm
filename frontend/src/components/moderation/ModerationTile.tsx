import React from "react";
import { useMutation } from "@apollo/client";
import REVIEW_REPORT_MUTATION from "../../graphql/reviewReportMutation.ts";
import ApproveIcon from "../../svg/ApproveIcon.tsx";
import CloseIcon from "../../svg/CloseIcon.tsx";

interface ModerationTileProps {
  reportedId: number;
  reportType: "user" | "publication" | "comment";
  title: string;
  reportCount: number;
  expanded: boolean;
  onExpandTile: () => void;
  onDecision: () => void;
}

const ModerationTile = ({ reportedId, reportType, title, contentType, reportCount, onDecision }: ModerationTileProps) => {
  const [reviewReport, { loading }] = useMutation(REVIEW_REPORT_MUTATION);
  const handleDecision = async (isSafe: boolean) => {
    try {
      const { data } = await reviewReport({
        variables: {
          reportedId: +reportedId,
          reportType,
          isSafe
        }
      });
      if (data?.reviewReport?.success) onDecision();
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-md border-l-4 border-gray-300 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded cursor-default">
              {reportCount} report{reportCount > 1 ? "s" : ""}
            </span>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => handleDecision(true)}
            className={`px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors flex items-center gap-1`}
          >
            {loading ? (
              "Traitement..."
            ) : (
              <>
                <ApproveIcon />
                Approve
              </>
            )}
          </button>
          <button
            onClick={() => handleDecision(false)}
            disabled={loading}
            className={`px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md transition-colors flex items-center gap-1 ${loading ? "opacity-50" : ""}`}
          >
            {loading ? (
              "Traitement..."
            ) : (
              <>
                <CloseIcon />
                Ban
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModerationTile;
