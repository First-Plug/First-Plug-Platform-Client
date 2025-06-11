"use client";
import { ChangeEvent, useCallback, useState } from "react";

type ValidatorType =
  | "required"
  | "password"
  | "email"
  | "userName"
  | "confirmPassowrd";

function validator(type: ValidatorType, passwordToCompare?: string) {
  const emailValidator = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.match(emailRegex)) {
      return "Enter a valid email address.";
    }
    return null;
  };

  const passwordValidator = (value: string) => {
    if (value.length < 6) {
      return "The password must be at least 6 characters long.";
    }

    // Regex updated to allow special characters but not require them
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#\$%\^&\*\(\)_\+\-=\[\]\{\};':"\\|,.<>\/?]{6,}$/;

    if (!regex.test(value)) {
      return "The password must contain at least one uppercase letter, one lowercase letter, and one number.";
    }

    return null;
  };
  const fullNameValidator = (value: string) => {
    if (value.length < 1) {
      return "This field is required";
    }
    return null;
  };
  const userNameValidator = (value: string) => {
    const onlyLettersRegex = /^[a-zA-Z\s]*$/; // Expresión regular para permitir solo letras y espacios
    const containsNumbersRegex = /[0-9]/; // Expresión regular para verificar números

    if (containsNumbersRegex.test(value)) {
      return "This field must not contain numbers.";
    }

    if (!onlyLettersRegex.test(value)) {
      return "This field must contain only letters and spaces.";
    }

    return null;
  };
  const confirmPassowrd = (value: string) => {
    if (value !== passwordToCompare) {
      return "The passwords must be equal.";
    }
    return null;
  };

  switch (type) {
    case "required": {
      return fullNameValidator;
    }
    case "password": {
      return passwordValidator;
    }
    case "email": {
      return emailValidator;
    }
    case "userName": {
      return userNameValidator;
    }
    case "confirmPassowrd": {
      return confirmPassowrd;
    }

    default:
      return null;
  }
}

interface InputState<T> {
  value: T;
  error: string | null;
  touched: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onFocus: () => void;
  handleOption: (option: T) => void;
  selectedOption: T;
  clearInput: () => void;
  passwordToCompare?: string;
}

export default function useInput<T>(
  initialValue: T,
  type: ValidatorType,
  isOptionInput = false,
  passwordToCompare?: string
): InputState<T> {
  const validateFunction = validator(type, passwordToCompare);
  const [value, setValue] = useState(initialValue);
  const [selectedOption, setSelectedOption] = useState(initialValue);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value as T);
      if (validateFunction) {
        if (type === "userName") setTouched(true);
        !isOptionInput
          ? type === "confirmPassowrd"
            ? setError(validateFunction(e.target.value as string))
            : setError(validateFunction(e.target.value as string))
          : setError(validateFunction(selectedOption as string));
      }
    },
    [validateFunction, isOptionInput, value, selectedOption, type]
  );

  const handleOption = useCallback((option: T) => {
    setSelectedOption(option);
  }, []);

  const onBlur = useCallback(() => {
    setTouched(true);
    const val = value as string;
    if (validateFunction && val.length) {
      !isOptionInput
        ? type === "confirmPassowrd"
          ? setError(validateFunction(value as string))
          : setError(validateFunction(value as string))
        : setError(validateFunction(selectedOption as string));
    }
  }, [validateFunction, isOptionInput, value, selectedOption, type]);

  const onFocus = useCallback(() => {
    setTouched(false);
    const val = value as string;
    if (validateFunction && val.length) {
      !isOptionInput
        ? type === "confirmPassowrd"
          ? setError(validateFunction(value as string))
          : setError(validateFunction(value as string))
        : setError(validateFunction(selectedOption as string));
    }
  }, [validateFunction, isOptionInput, value, selectedOption, type]);

  const clearInput = useCallback(() => {
    setValue(initialValue);
    setSelectedOption(initialValue);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    onChange,
    onBlur,
    onFocus,
    handleOption,
    selectedOption,
    clearInput,
  };
}
