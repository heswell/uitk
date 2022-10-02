import { forwardRef } from "react";
import { Icon, IconProps } from "@heswell/uitk-icons";

export const HoverIcon = forwardRef<SVGSVGElement, IconProps>(
  function HoverIcon(props, ref) {
    return (
      <Icon
        aria-label="attach"
        role="img"
        viewBox="0 0 12 12"
        {...props}
        ref={ref}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 4H8V5H10V4V2H8H4H2V4V8V10H4H5V8H4V4Z"
          fill="#4C505B"
          fillOpacity="0.4"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.00849 9.66133C6.91124 9.52024 6.78968 9.23413 6.57782 8.87747C6.45626 8.6815 6.15756 8.30917 6.06726 8.11712C6.00216 8.00041 5.98328 7.85831 6.01516 7.72519C6.06968 7.47208 6.28244 7.30418 6.51183 7.33326C6.68923 7.37347 6.85227 7.4716 6.9807 7.61545C7.07037 7.71075 7.15285 7.81432 7.2273 7.92507C7.28287 8.00346 7.29676 8.03481 7.35928 8.12496C7.42179 8.2151 7.46347 8.30525 7.43221 8.17199C7.4079 7.97602 7.36622 7.6468 7.30718 7.35285C7.26203 7.12945 7.25161 7.09418 7.20993 6.92565C7.16825 6.75711 7.14394 6.61602 7.09879 6.42397C7.05752 6.23528 7.02506 6.04428 7.00154 5.85175C6.95776 5.6055 6.98961 5.34977 7.09184 5.12668C7.21319 4.99788 7.3912 4.96388 7.54335 5.04045C7.69638 5.16796 7.81047 5.34602 7.86983 5.54996C7.96085 5.80095 8.02159 6.0646 8.05043 6.33383C8.106 6.72576 8.21367 7.29798 8.21715 7.41556C8.21715 7.27055 8.19283 6.96484 8.21715 6.82766C8.24123 6.68466 8.32931 6.56597 8.44985 6.51412C8.55328 6.4783 8.6627 6.47025 8.76938 6.4906C8.87706 6.516 8.97244 6.5859 9.03681 6.68657C9.11728 6.91522 9.16193 7.1579 9.16879 7.4038C9.17809 7.18847 9.21075 6.97524 9.26604 6.76887C9.32408 6.67659 9.40883 6.61006 9.50569 6.58075C9.62051 6.55705 9.73818 6.55705 9.853 6.58075C9.94716 6.61627 10.0295 6.68324 10.0892 6.77279C10.1627 6.98065 10.2073 7.20013 10.2212 7.4234C10.2212 7.47827 10.2455 7.27055 10.3219 7.13337C10.3616 7.00035 10.4612 6.90133 10.5831 6.87363C10.705 6.84592 10.8308 6.89373 10.9131 6.99905C10.9953 7.10436 11.0215 7.25118 10.9818 7.38421C10.9818 7.63896 10.9818 7.6272 10.9818 7.79965C10.9818 7.97211 10.9818 8.12496 10.9818 8.26997C10.9691 8.49932 10.9413 8.72728 10.8984 8.95194C10.838 9.15069 10.7539 9.33924 10.6484 9.5124C10.4797 9.72403 10.3404 9.96319 10.2351 10.2218C10.2089 10.3503 10.1972 10.482 10.2003 10.6137C10.2 10.7355 10.214 10.8567 10.242 10.9743C10.1 10.9912 9.9568 10.9912 9.8148 10.9743C9.67934 10.9508 9.51263 10.6451 9.46748 10.551C9.44514 10.5005 9.39942 10.4686 9.3494 10.4686C9.29937 10.4686 9.25365 10.5005 9.23131 10.551C9.1549 10.7 8.98471 10.9704 8.86663 10.9861C8.63392 11.0174 8.15463 10.9861 7.77605 10.9861C7.77605 10.9861 7.83857 10.5941 7.69617 10.453C7.55377 10.3119 7.4079 10.1473 7.30023 10.0376L7.00849 9.66133Z"
          fill="#4C505B"
          fillOpacity="0.4"
        />
      </Icon>
    );
  }
);
