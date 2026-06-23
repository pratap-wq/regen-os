export function getWashStatus(
  row
) {

  const sortingRequired =
    String(
      row.sortingRequired || ""
    ).toUpperCase();

  if (
    sortingRequired ===
    "YES"
  ) {

    return {
      nextProcess:
        "Colour Sorting",

      status:
        "READY_FOR_SORTING",
    };

  }

  return {

    nextProcess:
      "Extrusion",

    status:
      "READY_FOR_EXTRUSION",

  };

}

export function getSortingStatus() {

  return {

    nextProcess:
      "Extrusion",

    status:
      "READY_FOR_EXTRUSION",

  };

}

export function getExtrusionStatus() {

  return {

    nextProcess:
      "Dispatch",

    status:
      "READY_FOR_DISPATCH",

  };

}

export function buildDispatchLot(
  row
) {

  return {

    lotNo:
      row.extrusionBatchId,

    grade:
      row.productionGrade,

    availableQty:
      Number(
        row.fgOutputKg || 0
      ),

  };

}

export function calculateRecovery({
  input,
  output,
}) {

  input =
    Number(input || 0);

  output =
    Number(output || 0);

  if (input <= 0)
    return 0;

  return Number(
    (
      (output / input) *
      100
    ).toFixed(2)
  );

}

export function calculateLoss({
  input,
  output,
}) {

  input =
    Number(input || 0);

  output =
    Number(output || 0);

  return Number(
    (
      input - output
    ).toFixed(2)
  );

}

export function buildProductionMetrics({
  input,
  output,
}) {

  const recovery =
    calculateRecovery({
      input,
      output,
    });

  const loss =
    calculateLoss({
      input,
      output,
    });

  return {

    input:
      Number(input || 0),

    output:
      Number(output || 0),

    recovery,

    loss,

  };

}

export function getAlertSeverity(
  recovery
) {

  recovery =
    Number(recovery || 0);

  if (recovery < 60)
    return "CRITICAL";

  if (recovery < 70)
    return "HIGH";

  if (recovery < 80)
    return "MEDIUM";

  return "LOW";

}

export function validateStock({
  available,
  requested,
}) {

  available =
    Number(available || 0);

  requested =
    Number(requested || 0);

  return requested <= available;

}

export function validateDispatch({
  fgStock,
  dispatchQty,
}) {

  return validateStock({

    available:
      fgStock,

    requested:
      dispatchQty,

  });

}

export function validateRMConsumption({
  rmStock,
  washInput,
}) {

  return validateStock({

    available:
      rmStock,

    requested:
      washInput,

  });

}

export function validateWashConsumption({
  washStock,
  extrusionInput,
}) {

  return validateStock({

    available:
      washStock,

    requested:
      extrusionInput,

  });

}

export function generateOperationalAlert({
  module,
  message,
  severity =
    "HIGH",
}) {

  return {

    module,

    message,

    severity,

    timestamp:
      new Date()
        .toISOString(),

  };

}