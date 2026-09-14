(() => {

    /* =====================================================
       DEFAULT EXAMPLE

       10x1 - 1x2 + 2x3 = 6
       -1x1 + 11x2 - 1x3 = 25
       2x1 - 1x2 + 10x3 = -11
    ===================================================== */

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


    /* =====================================================
       DOM SHORTCUT
    ===================================================== */

    const $ = (id) =>
        document.getElementById(id);


    /* =====================================================
       CREATE THE 3 × 3 MATRIX

       THIS CREATES ALL 9 INPUT BOXES.
    ===================================================== */

    function createMatrixInputs() {

        const matrixContainer =
            $("matrixInputs");

        const vectorContainer =
            $("vectorInputs");


        matrixContainer.innerHTML = "";

        vectorContainer.innerHTML = "";


        /* -----------------------------
           CREATE A MATRIX
        ----------------------------- */

        for (let i = 0; i < 3; i++) {

            for (let j = 0; j < 3; j++) {

                const input =
                    document.createElement("input");


                input.type =
                    "number";


                input.step =
                    "any";


                input.id =
                    `a${i}${j}`;


                input.value =
                    defaultA[i][j];


                input.placeholder =
                    `a${i + 1}${j + 1}`;


                input.autocomplete =
                    "off";


                matrixContainer.appendChild(
                    input
                );
            }
        }


        /* -----------------------------
           CREATE VECTOR b
        ----------------------------- */

        for (let i = 0; i < 3; i++) {

            const input =
                document.createElement("input");


            input.type =
                "number";


            input.step =
                "any";


            input.id =
                `b${i}`;


            input.value =
                defaultB[i];


            input.placeholder =
                `b${i + 1}`;


            input.autocomplete =
                "off";


            vectorContainer.appendChild(
                input
            );
        }
    }


    /* =====================================================
       CLEAR INVALID INPUT HIGHLIGHTS
    ===================================================== */

    function clearInvalidInputs() {

        document
            .querySelectorAll(
                "input.invalid"
            )
            .forEach(input => {

                input.classList.remove(
                    "invalid"
                );

            });
    }


    /* =====================================================
       STATUS
    ===================================================== */

    function setStatus(
        message,
        type,
        badge,
        progress
    ) {

        const status =
            $("statusLine");

        const badgeElement =
            $("statusBadge");


        let icon = "i";


        if (type === "success") {
            icon = "✓";
        }

        else if (type === "warn") {
            icon = "!";
        }

        else if (type === "error") {
            icon = "×";
        }


        status.className =
            `status ${type}`;


        status.innerHTML = `
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
            `${progress}%`;
    }


    /* =====================================================
       SHOW ERRORS
    ===================================================== */

    function showErrors(errors) {

        const panel =
            $("errorPanel");

        const list =
            $("errorList");

        const empty =
            $("noErrorMessage");


        if (errors.length === 0) {

            panel.classList.remove(
                "show"
            );

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


    /* =====================================================
       HTML ESCAPING
    ===================================================== */

    function escapeHtml(text) {

        return String(text)
            .replace(
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


    /* =====================================================
       READ A NUMBER
    ===================================================== */

    function readNumber(
        id,
        label,
        errors
    ) {

        const input =
            $(id);


        const raw =
            input.value.trim();


        /* EMPTY */

        if (raw === "") {

            input.classList.add(
                "invalid"
            );


            errors.push(
                `${label} is required.`
            );


            return null;
        }


        /* NUMBER */

        const value =
            Number(raw);


        /* INVALID NUMBER */

        if (!Number.isFinite(value)) {

            input.classList.add(
                "invalid"
            );


            errors.push(
                `${label} must be a valid finite number.`
            );


            return null;
        }


        input.classList.remove(
            "invalid"
        );


        return value;
    }


    /* =====================================================
       VALIDATE INPUT
    ===================================================== */

    function validate() {

        clearInvalidInputs();


        const errors = [];


        /* --------------------------------
           READ 3 × 3 MATRIX A
        -------------------------------- */

        const A = [];


        for (let i = 0; i < 3; i++) {

            const row = [];


            for (let j = 0; j < 3; j++) {

                const value =
                    readNumber(
                        `a${i}${j}`,
                        `a${i + 1}${j + 1}`,
                        errors
                    );


                row.push(value);
            }


            A.push(row);
        }


        /* --------------------------------
           READ VECTOR b
        -------------------------------- */

        const b = [

            readNumber(
                "b0",
                "b₁",
                errors
            ),

            readNumber(
                "b1",
                "b₂",
                errors
            ),

            readNumber(
                "b2",
                "b₃",
                errors
            )

        ];


        /* --------------------------------
           READ INITIAL GUESS
        -------------------------------- */

        const initial = [

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


        /* --------------------------------
           READ TOLERANCE
        -------------------------------- */

        const tolerance =
            readNumber(
                "tolerance",
                "Tolerance",
                errors
            );


        /* --------------------------------
           READ MAX ITERATIONS
        -------------------------------- */

        const maxIterations =
            readNumber(
                "maxIterations",
                "Maximum iterations",
                errors
            );


        /* --------------------------------
           CHECK TOLERANCE
        -------------------------------- */

        if (
            tolerance !== null &&
            tolerance <= 0
        ) {

            $("tolerance")
                .classList.add("invalid");


            errors.push(
                "Tolerance must be greater than zero."
            );
        }


        /* --------------------------------
           CHECK ITERATIONS
        -------------------------------- */

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

            $("maxIterations")
                .classList.add("invalid");


            errors.push(
                "Maximum iterations must be an integer between 1 and 100000."
            );
        }


        /* --------------------------------
           CHECK DIAGONAL VALUES
        -------------------------------- */

        if (errors.length === 0) {

            for (let i = 0; i < 3; i++) {

                if (
                    Math.abs(
                        A[i][i]
                    ) < 1e-15
                ) {

                    $(`a${i}${i}`)
                        .classList.add(
                            "invalid"
                        );


                    errors.push(
                        `a${i + 1}${i + 1} cannot be zero because it is used as a divisor in Gauss-Seidel.`
                    );
                }
            }
        }


        /* --------------------------------
           RETURN DATA
        -------------------------------- */

        return {

            A,
            b,
            initial,
            tolerance,
            maxIterations,
            errors
        };
    }


    /* =====================================================
       GAUSS-SEIDEL METHOD

       The newly calculated values are immediately reused.

       x1(new) =
       (b1 - a12*x2(old) - a13*x3(old)) / a11

       x2(new) =
       (b2 - a21*x1(new) - a23*x3(old)) / a22

       x3(new) =
       (b3 - a31*x1(new) - a32*x2(new)) / a33
    ===================================================== */

    function gaussSeidel(
        A,
        b,
        initial,
        tolerance,
        maxIterations
    ) {

        let x =
            [...initial];


        const history = [];


        for (
            let iteration = 1;
            iteration <= maxIterations;
            iteration++
        ) {

            /* --------------------------------
               SAVE OLD VALUES
            -------------------------------- */

            const oldX =
                [...x];


            /* =================================
               GAUSS-SEIDEL X1

               Uses current x2 and x3.
            ================================= */

            x[0] =
                (
                    b[0]
                    - A[0][1] * x[1]
                    - A[0][2] * x[2]
                )
                /
                A[0][0];


            /* =================================
               GAUSS-SEIDEL X2

               IMPORTANT:
               Uses NEW x1.
            ================================= */

            x[1] =
                (
                    b[1]
                    - A[1][0] * x[0]
                    - A[1][2] * x[2]
                )
                /
                A[1][1];


            /* =================================
               GAUSS-SEIDEL X3

               IMPORTANT:
               Uses NEW x1 AND NEW x2.
            ================================= */

            x[2] =
                (
                    b[2]
                    - A[2][0] * x[0]
                    - A[2][1] * x[1]
                )
                /
                A[2][2];


            /* --------------------------------
               CHECK NUMERICAL VALIDITY
            -------------------------------- */

            if (
                x.some(
                    value =>
                        !Number.isFinite(
                            value
                        )
                )
            ) {

                return {

                    converged: false,

                    unstable: true,

                    x,

                    history,

                    iteration,

                    reason:
                        "The calculation produced a non-finite value. The system may be numerically unstable."
                };
            }


            /* --------------------------------
               CALCULATE INDIVIDUAL ERRORS
            -------------------------------- */

            const dx1 =
                Math.abs(
                    x[0] - oldX[0]
                );


            const dx2 =
                Math.abs(
                    x[1] - oldX[1]
                );


            const dx3 =
                Math.abs(
                    x[2] - oldX[2]
                );


            const maxError =
                Math.max(
                    dx1,
                    dx2,
                    dx3
                );


            /* --------------------------------
               STORE ITERATION
            -------------------------------- */

            history.push({

                iteration,

                x: [...x],

                dx1,

                dx2,

                dx3,

                maxError
            });


            /* --------------------------------
               CONVERGENCE TEST
            -------------------------------- */

            if (
                maxError <= tolerance
            ) {

                return {

                    converged: true,

                    unstable: false,

                    x,

                    history,

                    iteration,

                    reason:
                        "Convergence achieved."
                };
            }


            /* --------------------------------
               RUNAWAY VALUE PROTECTION
            -------------------------------- */

            if (
                x.some(
                    value =>
                        Math.abs(value) >
                        1e100
                )
            ) {

                return {

                    converged: false,

                    unstable: true,

                    x,

                    history,

                    iteration,

                    reason:
                        "The solution values are growing excessively. The system may be diverging."
                };
            }
        }


        /* --------------------------------
           MAX ITERATIONS
        -------------------------------- */

        return {

            converged: false,

            unstable: false,

            x,

            history,

            iteration: maxIterations,

            reason:
                "Maximum iteration limit reached before convergence."
        };
    }


    /* =====================================================
       NUMBER FORMATTER
    ===================================================== */

    function formatNumber(value) {

        if (
            !Number.isFinite(value)
        ) {

            return "NaN";
        }


        const abs =
            Math.abs(value);


        if (
            (
                abs !== 0 &&
                abs < 0.000001
            )
            ||
            abs >= 100000000
        ) {

            return value.toExponential(
                8
            );
        }


        return value.toFixed(8);
    }


    /* =====================================================
       RENDER SOLUTION
    ===================================================== */

    function renderSolution(
        result,
        tolerance,
        maxIterations
    ) {

        const solutionCard =
            $("solutionCard");


        solutionCard.style.display =
            "block";


        /* --------------------------------
           FINAL ANSWERS
        -------------------------------- */

        $("answerX1").textContent =
            formatNumber(
                result.x[0]
            );


        $("answerX2").textContent =
            formatNumber(
                result.x[1]
            );


        $("answerX3").textContent =
            formatNumber(
                result.x[2]
            );


        /* --------------------------------
           STATUS TAG
        -------------------------------- */

        if (result.converged) {

            $("solutionTag")
                .textContent =
                "CONVERGED";
        }

        else if (result.unstable) {

            $("solutionTag")
                .textContent =
                "UNSTABLE";
        }

        else {

            $("solutionTag")
                .textContent =
                "MAX ITER";
        }


        /* --------------------------------
           SUMMARY
        -------------------------------- */

        if (result.converged) {

            const last =
                result.history[
                    result.history.length - 1
                ];


            $("solutionSummary").textContent =
                `Converged successfully in ${result.iteration} iteration(s). ` +
                `Final maximum error = ${last.maxError.toExponential(4)}. ` +
                `Tolerance = ${tolerance}.`;
        }

        else {

            $("solutionSummary").textContent =
                `${result.reason} ` +
                `Last approximation is shown above. ` +
                `Iterations performed: ${result.iteration}/${maxIterations}.`;
        }


        /* --------------------------------
           ITERATION TABLE
        -------------------------------- */

        const body =
            $("historyBody");


        body.innerHTML = "";


        result.history.forEach(
            row => {

                const tr =
                    document.createElement(
                        "tr"
                    );


                if (
                    row.iteration ===
                    result.iteration
                ) {

                    tr.classList.add(
                        "final-row"
                    );
                }


                tr.innerHTML = `

                    <td>
                        ${row.iteration}
                    </td>

                    <td>
                        ${formatNumber(row.x[0])}
                    </td>

                    <td>
                        ${formatNumber(row.x[1])}
                    </td>

                    <td>
                        ${formatNumber(row.x[2])}
                    </td>

                    <td>
                        ${row.dx1.toExponential(3)}
                    </td>

                    <td>
                        ${row.dx2.toExponential(3)}
                    </td>

                    <td>
                        ${row.dx3.toExponential(3)}
                    </td>

                    <td>
                        ${row.maxError.toExponential(3)}
                    </td>

                `;


                body.appendChild(
                    tr
                );
            }
        );


        $("iterationCount")
            .textContent =
            `${result.history.length} STEPS`;
    }


    /* =====================================================
       RUN SOLVER
    ===================================================== */

    function runSolver() {

        const data =
            validate();


        /* SHOW INPUT ERRORS */

        showErrors(
            data.errors
        );


        /* STOP */

        if (
            data.errors.length > 0
        ) {

            setStatus(
                "Input validation failed. Correct the highlighted fields.",
                "error",
                "ERROR",
                0
            );


            $("solutionCard")
                .style.display =
                "none";


            return;
        }


        /* RUNNING */

        setStatus(
            "Initializing Gauss-Seidel iteration...",
            "info",
            "RUNNING",
            10
        );


        /*
           Small delay allows the status indicator
           to visibly update before the calculation.
        */

        setTimeout(() => {

            const result =
                gaussSeidel(
                    data.A,
                    data.b,
                    data.initial,
                    data.tolerance,
                    data.maxIterations
                );


            /* --------------------------------
               UPDATE STATUS
            -------------------------------- */

            if (result.converged) {

                setStatus(
                    `Convergence achieved in ${result.iteration} iteration(s).`,
                    "success",
                    "DONE",
                    100
                );
            }

            else if (result.unstable) {

                setStatus(
                    "The calculation became numerically unstable.",
                    "error",
                    "UNSTABLE",
                    100
                );
            }

            else {

                setStatus(
                    "Maximum iterations reached before convergence.",
                    "warn",
                    "MAX ITER",
                    100
                );
            }


            /* --------------------------------
               SHOW SOLUTION
            -------------------------------- */

            renderSolution(
                result,
                data.tolerance,
                data.maxIterations
            );


            /* --------------------------------
               SOLVER-LEVEL ERROR
            -------------------------------- */

            if (
                result.unstable
            ) {

                showErrors([
                    result.reason
                ]);
            }

            else if (
                !result.converged
            ) {

                showErrors([
                    result.reason
                ]);
            }

            else {

                showErrors([]);
            }


            /* --------------------------------
               SCROLL TO LAST SECTION
            -------------------------------- */

            $("solutionCard")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


        }, 120);
    }


    /* =====================================================
       RESET
    ===================================================== */

    function resetAll() {

        createMatrixInputs();


        $("tolerance").value =
            "0.000001";


        $("maxIterations").value =
            "100";


        $("x10").value =
            "0";


        $("x20").value =
            "0";


        $("x30").value =
            "0";


        $("solutionCard")
            .style.display =
            "none";


        $("iterationDetails").open =
            false;


        clearInvalidInputs();


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


    /* =====================================================
       INITIALIZE
    ===================================================== */

    createMatrixInputs();


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


    /* Remove invalid styling when user edits */

    document.addEventListener(
        "input",
        event => {

            if (
                event.target.matches(
                    "input"
                )
            ) {

                event.target.classList.remove(
                    "invalid"
                );
            }
        }
    );

})();
