-- This script populates your 'lessons' table with all 18 lessons
-- It pulls the content directly from your lesson-formX-XX.html files.

-- Clear any old data first (optional, but safe)
TRUNCATE TABLE lessons;

-- --- FORM 4 LESSONS ---

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-01',
    'Quadratic Functions & Equations in One Variable',
    'Form 4 - Module 01',
    '<p>This module builds fluency with the three equivalent forms of a quadratic function: standard form <em>y = ax<sup>2</sup> + bx + c</em>, factored form, and vertex form. You will investigate how changing the values of <em>a</em>, <em>b</em>, and <em>c</em> affects the graph, and how the discriminant reveals the number of real roots a quadratic equation possesses.</p><ul><li>Sketch parabolas by identifying axis of symmetry, roots, and vertex.</li><li>Select a solving method (factorisation, completing the square, quadratic formula) suited to the equation.</li><li>Interpret solutions within financial, measurement, and motion contexts.</li></ul>',
    '<ul><li>Formula Booklet: Quadratic identities & discriminant definitions.</li><li>Interactive Graph Tool: Visualise how parameter changes stretch or shift a parabola.</li><li>Practice Pack: 20 exam-style questions arranged by difficulty.</li></ul>',
    'Source: html/lesson-form4-01.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-02',
    'Number Bases & Conversions',
    'Form 4 - Module 02',
    '<p>A number base tells you which digits are allowed and how each place represents powers of that base. ... A numeral such as (d<sub>k</sub> d<sub>k-1</sub> ... d<sub>1</sub> d<sub>0</sub>)<sub>b</sub> represents the expanded sum d<sub>k</sub>b<sup>k</sup> + ... + d<sub>0</sub>.</p>',
    '<ul><li><strong>Base b to base 10:</strong> Expand using place value and sum digit times b to the relevant power.</li><li><strong>Base 10 to base b:</strong> Use repeated division by b and read the remainders from last to first.</li><li><strong>Between non-decimal bases:</strong> Convert via base 10 or group digits...</li></ul>',
    'Source: html/lesson-form4-02.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-03',
    'Logical Reasoning: Statements & Arguments',
    'Form 4 - Module 03',
    '<p>A statement is any sentence that can be labelled true or false. We build complex statements with AND, OR, and NOT... Conditional statements (if P then Q) have relatives: converse, inverse, and contrapositive.</p><p>Arguments chain statements together. An argument is valid when true premises force the conclusion to be true...</p>',
    '<ul><li>Classify sentences as statements or non-statements.</li><li>Write truth tables and find negations, converses, and contrapositives.</li><li>Test arguments for validity and identify common fallacies.</li></ul>',
    'Source: html/lesson-form4-03.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-04',
    'Operations on Sets',
    'Form 4 - Module 04',
    '<p>Sets collect related elements. Union (A U B) captures everything in A or B, intersection (A n B) keeps only the overlap... Complements depend on the universal set U...</p><p>De Morgan''s laws... help simplify expressions and solve questions quickly.</p>',
    '<ul><li>Interpret subset notation and cardinality relationships.</li><li>Apply inclusion and exclusion principles to count elements across sets.</li><li>Use Venn diagrams and De Morgan''s laws to simplify expressions.</li></ul>',
    'Source: html/lesson-form4-04.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-05',
    'Networks & Graph Theory Basics',
    'Form 4 - Module 05',
    '<p>A graph (or network) is a set of vertices linked by edges. Degree counts how many edges touch a vertex... Euler trails use every edge once, Hamiltonian paths visit every vertex once...</p><p>Weighted graphs assign distances or costs...</p>',
    '<ul><li>Determine degrees and classify Euler vs Hamiltonian possibilities.</li><li>Apply rules for existence of Euler trails/circuits and properties of trees.</li><li>Use shortest-path or spanning-tree ideas to interpret network diagrams.</li></ul>',
    'Source: html/lesson-form4-05.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-06',
    'Linear Inequalities in Two Variables',
    'Form 4 - Module 06',
    '<p>Inequalities such as ax + by <= c describe half-planes. The boundary line... is solid for <= or >= and dashed for < or >. Pick a test point (often (0,0)) to decide which side to shade.</p><p>Systems combine several inequalities. Their solution set is the overlapping region...</p>',
    '<ul><li>Convert inequalities to boundary-line form and determine intercepts.</li><li>Decide whether the boundary is solid or dashed and test shading.</li><li>Graph feasible regions for systems and interpret coordinate solutions.</li></ul>',
    'Source: html/lesson-form4-06.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-07',
    'Graphs of Motion',
    'Form 4 - Module 07',
    '<p>In distance-time graphs, slope equals speed. Flat segments mean resting, steeper segments mean faster travel...</p><p>In speed-time graphs, slope equals acceleration and the area under the curve equals distance travelled...</p>',
    '<ul><li>Describe motion stories from distance-time graphs.</li><li>Compute distance as area under speed-time graphs.</li><li>Interpret acceleration from slopes and compare motion segments.</li></ul>',
    'Source: html/lesson-form4-07.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-08',
    'Measures of Dispersion (Ungrouped Data)',
    'Form 4 - Module 08',
    '<p>Dispersion tells the story of variability. Range compares extremes, IQR captures the middle 50%... Variance and standard deviation square deviations...</p><p>Understand how adding or multiplying all data values affects each measure...</p>',
    '<ul><li>Compute range, IQR, MAD, variance, and standard deviation for raw data.</li><li>Explain which measures resist outliers best.</li><li>Describe how shifting or scaling data transforms each measure.</li></ul>',
    'Source: html/lesson-form4-08.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-09',
    'Probability of Combined Events',
    'Form 4 - Module 09',
    '<p>For any events A and B, use P(A U B) = P(A) + P(B) - P(A n B). Mutually exclusive events have P(A n B) = 0. Independent events satisfy P(A n B) = P(A)P(B)...</p><p>Tree diagrams and tables help visualise sequential events...</p>',
    '<ul><li>Decide when events are mutually exclusive, independent, or dependent.</li><li>Apply addition and multiplication rules accurately.</li><li>Use conditional probability to interpret real contexts (with or without replacement).</li></ul>',
    'Source: html/lesson-form4-09.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form4-10',
    'Consumer Mathematics: Financial Planning & Management',
    'Form 4 - Module 10',
    '<p>Budgeting balances income against needs and wants... Interest can be simple (I = P r t) or compound (A = P(1 + r / n)^(n t)). Compare best buys using unit pricing...</p><p>Understand effective annual rates, discounts, and amortisation...</p>',
    '<ul><li>Compute simple and compound interest plus effective rates.</li><li>Analyse budgets, percentage increases, and best-buy comparisons.</li><li>Explain debt strategies, emergency funds, and amortisation behaviour.</li></ul>',
    'Source: html/lesson-form4-10.html'
);

-- --- FORM 5 LESSONS ---

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-01',
    'Variation (Direct, Inverse & Joint)',
    'Form 5 - Module 01',
    '<p>Variation problems always begin with a relationship statement: "y varies directly as x" becomes y = kx^n, inverse variation becomes y = k / x^n...</p><p>Track exponents and units... When a variable changes by a percentage or factor, apply the same multiplier...</p>',
    '<ul><li>Underline the trigger words (direct, inversely, jointly) and write the proportional statement...</li><li>Use the provided pair of values to solve for the constant k...</li><li>When multiple variables vary together, treat any unchanged variable as a constant...</li></ul>',
    'Source: html/lesson-form5-01.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-02',
    'Matrices & Operations',
    'Form 5 - Module 02',
    '<p>A matrix is simply a rectangular array with dimensions rows x columns. Two matrices are equal only when their orders and every corresponding entry match...</p><p>Thinking about rows and columns as vectors helps when performing dot products for multiplication...</p>',
    '<ul><li>State the order of every matrix before deciding what operation is possible.</li><li>Use element-by-element addition or subtraction only when orders match exactly.</li><li>For multiplication, write the row of the first matrix and column of the second...</li></ul>',
    'Source: html/lesson-form5-02.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-03',
    'Consumer Math: Insurance',
    'Form 5 - Module 03',
    '<p>Insurance is a contract that shifts the possibility of loss from an individual to an insurer... Premiums rise with higher risk profiles or wider coverage...</p><p>You will interpret real policy snippets, calculate out-of-pocket costs when deductibles or co-insurance apply...</p>',
    '<ul><li><strong>Risk:</strong> the possibility of loss; not every negative event is insurable.</li><li><strong>Premium:</strong> the periodic payment made to secure coverage...</li><li><strong>Sum assured, deductible, and co-insurance:</strong> determine how much the insurer pays...</li></ul>',
    'Source: html/lesson-form5-03.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-04',
    'Consumer Math: Taxation',
    'Form 5 - Module 04',
    '<p>SST has two components: a sales tax applied once at the manufacturing or import stage, and a service tax imposed on specific services... Personal income tax is progressive...</p><p>You will read short cases, identify whether SST applies, and practise rearranging the chargeable income formula...</p>',
    '<ul><li>SST stands for Sales and Service Tax; it is not charged at every stage like GST.</li><li>Tax reliefs and rebates bring down the chargeable income...</li><li>Progressive systems mean a higher bracket attracts a higher rate...</li></ul>',
    'Source: html/lesson-form5-04.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-05',
    'Congruent, Enlargement & Combined Transformations',
    'Form 5 - Module 05',
    '<p>Congruent figures share the same shape and size... Enlargement introduces a scale factor (k) that multiplies lengths by (k) and areas by (k^2). Negative scale factors reflect...</p><p>We group these skills under the same chapter so you can connect congruency tests, vector descriptions...</p>',
    '<ul><li>State the centre and scale factor whenever you describe an enlargement...</li><li>For combined moves, write them in the order performed...</li><li>Remember that a regular tessellation needs one regular polygon repeated with no overlaps.</li></ul>',
    'Source: html/lesson-form5-05.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-06',
    'Ratio & Graph of Trigonometric Functions',
    'Form 5 - Module 06',
    '<p>This module revisits the unit circle so you can determine exact values... and infer signs in every quadrant using the ASTC mnemonic... From there, you sketch or read sine and cosine graphs...</p><p>Scaling the graph with amplitudes or vertical stretches changes only the range...</p>',
    '<ul><li>Memorise benchmark values at 0, 30, 45, 60, 90, 180, 270, and 360 degrees.</li><li>Quote the period and amplitude whenever you describe a trig graph.</li><li>State where tangent is undefined by listing the angles of its vertical asymptotes.</li></ul>',
    'Source: html/lesson-form5-06.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-07',
    'Measures of Dispersion for Grouped Data',
    'Form 5 - Module 07',
    '<p>Unlike ungrouped data, grouped data require estimating with class midpoints. Mean is computed with the ratio (sum of fx) / (sum of f), while variance uses (sum of fx^2) / (sum of f) minus (mean)^2...</p><p>You will also reason about skewness (mean vs median)...</p>',
    '<ul><li>Use class midpoints when estimating range or calculating the sum of fx and fx^2.</li><li>Build a cumulative frequency table to read off quartile positions quickly.</li><li>State the median position ((sum of f) / 2) before interpolating...</li></ul>',
    'Source: html/lesson-form5-07.html'
);

INSERT INTO lessons (lesson_id, title, eyebrow, overview, concepts, source)
VALUES (
    'form5-08',
    'Mathematical Modelling',
    'Form 5 - Module 08',
    '<p>Modelling always starts with clarity: what quantity are we trying to predict and under what conditions? From there, we define assumptions, introduce variables, and choose a mathematical relationship...</p><p>The Form 5 notes emphasise using given data to estimate parameters...</p>',
    '<ul><li>Define the problem and scope.</li><li>List assumptions and choose variables or parameters.</li><li>Build, test, and refine the model before presenting results with context and limitations.</li></ul>',
    'Source: html/lesson-form5-08.html'
);