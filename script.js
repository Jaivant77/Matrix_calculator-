(() => {

    /* =========================================
       DEFAULT MATRIX
    ========================================= */

    const defaultA = [
        [10, -1, 2],
        [-1, 11, -1],
        [2, -1, 10]
    ];

    const defaultB = [
        6,
        25,
        -11
    ];


    /* =========================================
       SHORT DOM SELECTOR
    ========================================= */

    const $ = (id) => document.getElementById(id);


    /* =========================================
       CREATE MATRIX INPUTS
    ========================================= */

    function createInputs() {

        const matrix =
            $("matrixInputs");

        const vector =
            $("vectorInputs");

        matrix.innerHTML = "";

        vector.innerHTML = "";


        for (let i = 0; i < 3; i++) {

            for (let j = 0; j < 3; j++) {

                const input =
                    document.createElement("input");

                input.type = "number";

                input.step = "any";

                input.id =
                    `a${i}${j}`;

                input.value =
                    defaultA[i][j];

                input.placeholder =
                    `a${i + 1}${j + 1}`;

                matrix.appendChild(input);
            }


            const b =
                document.createElement("input");

            b.type = "number";

            b.step = "any";

            b.id =
                `b${i}`;

            b.value =
                defaultB[i];

            b.placeholder =
                `b${i + 1}`;

            vector.appendChild(b);
        }
    }


    /* =========================================
       INVALID INPUT HIGHLIGHT
    ========================================= */

    function markInvalid(
        id,
        state = true
    ) {

        const element =
            $(id);

        if (!element)
            return;

        element.classList.toggle(
            "invalid",
            state
        );
    }


    function clearInvalids() {

        document
            .querySelectorAll(
                "input.invalid"
            )
            .forEach(
                input =>
                    input.classList.remove(
                        "invalid"
                    )
            );
    }


    /* =========================================
       STATUS DISPLAY
    ========================================= */

    function setStatus(
        message,
        type = "info",
        badge = "READY",
        progress = 0
    ) {

        const line =
            $("statusLine");

        const badgeElement =
            $("statusBadge");


        let icon = "i";

        if (type === "success")
            icon = "✓";

        else if (type === "warn")
            icon = "!";

        else if (type === "error")
            icon = "×";


        line.className =
            `status-line status-${type}`;


        line.innerHTML = `
            <span class="status-icon">
                ${icon}
            </span>

            <span>
                ${message}
            </span>
        `;


        badgeElement.textContent =
            badge;


        $("progressBar").style.width =
            `${Math.max(
                0,
                Math.min(
                    100,
                    progress
                )
            )}%`;
    }


    /* =========================================
       ERROR PANEL
    ========================================= */

    function showErrors(errors) {

        const panel =
            $("errorPanel");

        const list =
            $("errorList");

        const empty =
            $("noErrorMessage");


        if (!errors.length) {

            panel.classList.remove("show");

            empty.style.display =
                "block";

            return;
        }


        list.innerHTML =
            errors
                .map(
                    error =>
                        `<li>${escapeHtml(error)}</li>`
                )
                .join("");


        panel.classList.add(
            "show"
        );

        empty.style.display =
            "none";
    }


    /* =========================================
       HTML ESCAPE
    ========================================= */

    function escapeHtml(value) {

        return value.replace(
            /[&<>"']/g,

            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[character])
        );
    }


    /* =========================================
       READ NUMBER
    ========================================= */

    function readNumber(
        id,
        label,
        errors
    ) {

        const raw =
            $(id).value.trim();


        if (raw === "") {

            markInvalid(
                id,
                true
            );

            errors.push(
                `${label} is required.`
            );

            return null;
        }


        const value =
            Number(raw);


        if (!Number.isFinite(value)) {

            markInvalid(
                id,
                true
            );

            errors.push(
                `${label} must be a finite number.`
            );

            return null;
        }


        markInvalid(
            id,
            false
        );


        return value;
    }


    /* =========================================
       VALIDATE ALL INPUTS
    ========================================= */

    function validate() {

        clearInvalids();


        const errors = [];


        /* MATRIX */

        const A =
            Array.from(
                { length: 3 },

                (_, i) =>
                    Array.from(
                        { length: 3 },

                        (_, j) =>
                            readNumber(
                                `a${i}${j}`,
                                `a${i + 1}${j + 1}`,
                                errors
                            )
                    )
            );


        /* RHS VECTOR */

        const b = [

            readNumber(
                "b0",
                "b1",
                errors
            ),

            readNumber(
                "b1",
                "b2",
                errors
            ),

            readNumber(
                "b2",
                "b3",
                errors
            )

        ];


        /* INITIAL VALUES */

        const guess = [

            readNumber(
                "x10",
                "Initial x₁",
                errors
            ),

            readNumber(
                "x20",
                "Initial x₂",
                errors
            ),

            readNumber(
                "x30",
                "Initial x₃",
                errors
            )

        ];


        /* TOLERANCE */

        const tolerance =
            readNumber(
                "tolerance",
                "Tolerance",
                errors
            );


        /* MAX ITERATIONS */

        const maxIterations =
            readNumber(
                "maxIterations",
                "Maximum iterations",
                errors
            );


        /* TOLERANCE CHECK */

        if (
            tolerance !== null &&
            tolerance <= 0
        ) {

            markInvalid(
                "tolerance",
                true
            );

            errors.push(
                "Tolerance must be greater than 0."
            );
        }


        /* MAX ITERATION CHECK */

        if (
            maxIterations !== null &&
            (
                !Number.isInteger(
                    maxIterations
                ) ||
                maxIterations < 1 ||
                maxIterations > 100000
            )
        ) {

            markInvalid(
                "maxIterations",
                true
            );

            errors.push(
                "Maximum iterations must be an integer between 1 and 100000."
            );
        }


        /* DIAGONAL CHECK */

        if (errors.length === 0) {

            for (let i = 0; i < 3; i++) {

                if (
                    Math.abs(
                        A[i][i]
                    ) < 1e-15
                ) {

                    markInvalid(
                        `a${i}${i}`,
                        true
                    );

                    errors.push(
                        `Diagonal element a${i + 1}${i + 1} cannot be zero.`
                    );
                }
            }
        }


        return {
            A,
            b,
            guess,
            tolerance,
            maxIterations,
            errors
        };
    }


    /* =========================================
       GAUSS-SEIDEL SOLVER
       
       IMPORTANT:
       The Gauss-Seidel equations are
       implemented directly here.

       x1(k+1) =
       [b1 - a12*x2(k) - a13*x3(k)] / a11

       x2(k+1) =
       [b2 - a21*x1(k+1) - a23*x3(k)] / a22

       x3(k+1) =
       [b3 - a31*x1(k+1) - a32*x2(k+1)] / a33
    ========================================= */

    function solveGaussSeidel(
        A,
        b,
        initial,
        tolerance,
        maxIterations
    ) {

        let x =
            [...initial];


        const rows = [];


        for (
            let iteration = 1;
            iteration <= maxIterations;
            iteration++
        ) {

            const oldX =
                [...x];


            /* ===============================
               STEP 1
               CALCULATE X1
            =============================== */

            x[0] =
                (
                    b[0]
                    - A[0][1] * x[1]
                    - A[0][2] * x[2]
                )
                / A[0][0];


            /* ===============================
               STEP 2
               CALCULATE X2

               NEW x1 IS USED IMMEDIATELY
            =============================== */

            x[1] =
                (
                    b[1]
                    - A[1][0] * x[0]
                    - A[1][2] * x[2]
                )
                / A[1][1];


            /* ===============================
               STEP 3
               CALCULATE X3

               NEW x1 AND x2 ARE USED
            =============================== */

            x[2] =
                (
                    b[2]
                    - A[2][0] * x[0]
                    - A[2][1] * x[1]
                )
                / A[2][2];


            /* CHECK NUMERICAL VALIDITY */

            if (
                x.some(
                    value =>
                        !Number.isFinite(value)
                )
            ) {

                return {

                    converged: false,

                    diverged: true,

                    x,

                    rows,

                    iteration,

                    reason:
                        "A non-finite value was produced. The iteration may be diverging or numerically unstable."
                };
            }


            /* ===============================
               ERROR CALCULATION
            =============================== */

            const deltas = [

                Math.abs(
                    x[0] - oldX[0]
                ),

                Math.abs(
                    x[1] - oldX[1]
                ),

                Math.abs(
                    x[2] - oldX[2]
                )

            ];


            const maxError =
                Math.max(
                    ...deltas
                );


            /* STORE ITERATION */

            rows.push({

                iteration,

                x: [...x],

                deltas,

                maxError

            });


            /* ===============================
               CONVERGENCE CHECK
            =============================== */

            if (
                maxError <= tolerance
            ) {

                return {

                    converged: true,

                    diverged: false,

                    x,

                    rows,

                    iteration,

                    reason:
                        "Convergence criterion satisfied."
                };
            }


            /* ===============================
               RUNAWAY VALUE PROTECTION
            =============================== */

            if (
                x.some(
                    value =>
                        Math.abs(value) > 1e100
                )
            ) {

                return {

                    converged: false,

                    diverged: true,

                    x,

                    rows,

                    iteration,

                    reason:
                        "Values grew beyond a safe numerical range."
                };
            }
        }


        return {

            converged: false,

            diverged: false,

            x,

            rows,

            iteration: maxIterations,

            reason:
                "Maximum iteration count reached before convergence."
        };
    }


    /* =========================================
       NUMBER FORMATTING
    ========================================= */

    function fmt(value) {

        if (
            !Number.isFinite(value)
        ) {

            return "NaN";
        }


        const absolute =
            Math.abs(value);


        if (
            (
                absolute !== 0 &&
                absolute < 1e-6
            ) ||
            absolute >= 1e8
        ) {

            return value.toExponential(8);
        }


        return value.toFixed(8);
    }


    /* =========================================
       DISPLAY SOLUTION
    ========================================= */

    function renderResult(
        result,
        tolerance,
        maxIterations
    ) {

        $("solutionCard").style.display =
            "block";


        $("answerX1").textContent =
            fmt(result.x[0]);


        $("answerX2").textContent =
            fmt(result.x[1]);


        $("answerX3").textContent =
            fmt(result.x[2]);


        /* RESULT STATUS */

        let state = "MAX ITER";

        if (result.converged)
            state = "CONVERGED";

        else if (result.diverged)
            state = "UNSTABLE";


        $("solutionTag").textContent =
            state;


        /* SUMMARY */

        let summary;


        if (result.converged) {

            const finalError =
                result.rows[
                    result.rows.length - 1
                ].maxError;


            summary =
                `Converged in ${result.iteration} iteration(s). ` +
                `Final maximum error = ` +
                `${finalError.toExponential(4)}, ` +
                `tolerance = ${tolerance}.`;
        }


        else {

            summary =
                `${result.reason} ` +
                `Last computed approximation is shown above. ` +
                `Iterations performed: ` +
                `${result.iteration}/${maxIterations}.`;
        }


        $("solutionSummary").textContent =
            summary;


        /* ITERATION TABLE */

        const body =
            $("historyBody");


        body.innerHTML =
            result.rows
                .map(
                    row => `

                    <tr
                        class="${
                            row.iteration === result.iteration
                                ? "final-row"
                                : ""
                        }"
                    >

                        <td>
                            ${row.iteration}
                        </td>

                        <td>
                            ${fmt(row.x[0])}
                        </td>

                        <td>
                            ${fmt(row.x[1])}
                        </td>

                        <td>
                            ${fmt(row.x[2])}
                        </td>

                        <td>
                            ${row.deltas[0].toExponential(3)}
                        </td>

                        <td>
                            ${row.deltas[1].toExponential(3)}
                        </td>

                        <td>
                            ${row.deltas[2].toExponential(3)}
                        </td>

                        <td>
                            ${row.maxError.toExponential(3)}
                        </td>

                    </tr>

                `
                )
                .join("");


        $("iterationCount").textContent =
            `${result.rows.length} STEPS`;
    }


    /* =========================================
       MAIN SOLVER
    ========================================= */

    function runSolver() {

        const data =
            validate();


        showErrors(
            data.errors
        );


        /* STOP ON ERRORS */

        if (
            data.errors.length
        ) {

            setStatus(
                "Input validation failed. Correct the highlighted fields.",
                "error",
                "ERROR",
                0
            );


            $("solutionCard").style.display =
                "none";


            return;
        }


        /* RUN MESSAGE */

        setStatus(
            "Running Gauss-Seidel iterations...",
            "info",
            "RUNNING",
            15
        );


        /* ALLOW UI UPDATE */

        setTimeout(() => {

            const result =
                solveGaussSeidel(
                    data.A,
                    data.b,
                    data.guess,
                    data.tolerance,
                    data.maxIterations
                );


            /* STATUS */

            if (result.converged) {

                setStatus(
                    "Gauss-Seidel converged successfully.",
                    "success",
                    "DONE",
                    100
                );
            }


            else if (result.diverged) {

                setStatus(
                    "The solver became numerically unstable.",
                    "error",
                    "UNSTABLE",
                    100
                );
            }


            else {

                setStatus(
                    "Maximum iteration count reached before convergence.",
                    "warn",
                    "MAX ITER",
                    100
                );
            }


            /* RESULT */

            renderResult(
                result,
                data.tolerance,
                data.maxIterations
            );


            /* SOLVER ERROR */

            if (
                result.diverged ||
                !result.converged
            ) {

                showErrors([
                    result.reason
                ]);
            }


            else {

                showErrors([]);
            }


            /* SCROLL TO SOLUTION */

            $("solutionCard")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


        }, 100);
    }


    /* =========================================
       RESET
    ========================================= */

    function resetAll() {

        createInputs();


        $("x10").value = 0;

        $("x20").value = 0;

        $("x30").value = 0;


        $("tolerance").value =
            "0.000001";


        $("maxIterations").value =
            "100";


        $("solutionCard").style.display =
            "none";


        $("iterationDetails").open =
            false;


        clearInvalids();


        showErrors([]);


        setStatus(
            "Waiting for matrix input. The solver is ready.",
            "info",
            "IDLE",
            0
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =========================================
       INITIALIZE
    ========================================= */

    createInputs();


    $("solveBtn")
        .addEventListener(
            "click",
            runSolver
        );


    $("resetBtn")
        .addEventListener(
            "click",
            resetAll
        );


    /* Remove invalid highlight while editing */

    document.addEventListener(
        "input",
        event => {

            if (
                event.target.matches("input")
            ) {

                event.target.classList.remove(
                    "invalid"
                );
            }
        }
    );

})();
