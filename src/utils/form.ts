export const validateCheckboxSection =
  (customValidity: string) => (event: React.FormEvent<HTMLFieldSetElement>) => {
    const checkboxes = event.currentTarget.querySelectorAll("input");

    const firstCheckbox = checkboxes[0];
    if (firstCheckbox) {
      firstCheckbox.required = false;
    }

    const noChecbkoxiesChecked =
      Array.from(checkboxes).filter((input) => input.checked).length === 0;
    noChecbkoxiesChecked
      ? firstCheckbox?.setCustomValidity(customValidity)
      : firstCheckbox?.setCustomValidity("");
  };