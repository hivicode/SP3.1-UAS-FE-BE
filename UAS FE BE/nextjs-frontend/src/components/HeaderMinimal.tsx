"use client";
import Link from "next/link";
import React from "react";

export default function HeaderMinimal() {
  return (
    <div suppressHydrationWarning data-wf--navbar--variant="base" data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="nav_component w-nav">
      <div className="padding-global">
        <div className="container-large">
          <div className="nav-wrap" style={{ justifyContent: "center" }}>
            <Link href="/" className="nav_brand w-inline-block" style={{ display: "flex", alignItems: "center" }}>
              <span>
                <img src="https://wubflow-shield.NOCODEXPORT.DEV/685077c466f113761c6d796b/685405fce8267d81b0374af7_Kaleo_Icon-black.svg" loading="lazy" alt="Kaleo Icon" style={{ height: "3rem", width: "auto" }} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
