import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center items-center">
          <span className="text-sm text-gray-600 mr-2">
            By{" "}
            <a
              href="https://twitter.com/leo5imon"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leo Simon
            </a>
            , powered by
          </span>
          <a
            href="https://glif.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:underline"
          >
            <img src="glif_logo.png" alt="Glif logo" className="w-20 mr-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
