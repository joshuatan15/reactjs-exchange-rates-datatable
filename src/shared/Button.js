import React from "react";
import classes from "./Button.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {} from "@fortawesome/fontawesome-free-solid";

const Button = (props) => {
  return (
    <button
      data-testid={props.id}
      type={props.type || "button"}
      className={`${classes.button} ${props.className}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      <span className={classes.button__text}>{props.text}</span>
      <span className={classes.button__icon}>
        <FontAwesomeIcon icon={props.icon} />
      </span>
    </button>
  );
};

export default Button;
