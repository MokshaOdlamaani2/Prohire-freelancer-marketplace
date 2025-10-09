import React, { useState } from "react";
import "../styles/componentsStyle.css";

const ProposalForm = ({ onSubmit, submitting }) => {
  const [portfolioLink, setPortfolioLink] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ portfolioLink, contactInfo });
  };

  return (
    <form onSubmit={handleSubmit} className="proposal-form">
      <div>
        <label htmlFor="portfolioLink">Portfolio Link (required):</label>
        <input
          id="portfolioLink"
          type="url"
          value={portfolioLink}
          onChange={(e) => setPortfolioLink(e.target.value)}
          required
          placeholder="https://yourportfolio.com"
          disabled={submitting}
        />
      </div>
      <div>
        <label htmlFor="contactInfo">Contact Info (optional):</label>
        <input
          id="contactInfo"
          type="text"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          placeholder="Email or phone"
          disabled={submitting}
        />
      </div>
      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? "Submitting..." : "Submit Proposal"}
      </button>
    </form>
  );
};

export default ProposalForm;
