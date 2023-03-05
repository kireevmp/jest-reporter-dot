import chalk from "chalk"

import type {
  Reporter,
  AggregatedResult,
  ReporterOnStartOptions,
  TestContext,
  TestResult,
  Test,
  Config,
} from "@jest/reporters"

const isTerminalApp = process.env.TERM_PROGRAM === "Apple_Terminal"

const color = {
  pass: chalk.green,
  fail: chalk.red,
  working: chalk.yellow,
  skipped: chalk.magenta,
  gray: chalk.gray,
}

const status = {
  fail: "✘",
  skipped: "○",
  pass: "✔",
}

const enum TestStatus {
  pending = "pending",
  working = "working",
  skipped = "skipped",
  pass = "pass",
  fail = "fail",
}

class JestReporterDot implements Reporter {
  map: Map<string, number> = new Map()

  current = 0
  bar: TestStatus[] = []

  tests: number[] = []

  estimatedTime = 0
  clock: NodeJS.Timeout

  disabled: boolean = false

  globalConfig: Config.GlobalConfig

  constructor(globalConfig: Config.GlobalConfig) {
    this.globalConfig = globalConfig

    if (globalConfig.verbose) {
      this.disabled = true
    }
  }

  public onRunStart(
    { numTotalTestSuites }: AggregatedResult,
    options: ReporterOnStartOptions
  ) {
    if (this.disabled) {
      process.stderr.write(
        chalk.yellow.bold`\n[JestReporterDot] ` +
          chalk.yellow`The dot reporter is not compatible with Jest ${chalk.italic`"verobse"`} option. ` +
          chalk.yellow`The reporter will be disabled for this run.\n`
      )

      return
    }

    this.bar = new Array(numTotalTestSuites).fill(TestStatus.pending)
    this.tests = new Array(numTotalTestSuites).fill(0)

    this.estimatedTime = options.estimatedTime

    this.clock = setInterval(this.tick.bind(this), 1000)

    process.stderr.write(color.gray`\nFound ${numTotalTestSuites} suites.\n`)

    this.current = 0
    this.saveCursor()
    this.push()
  }

  public onTestFileStart(test: Test) {
    if (this.disabled) return

    const our = this.current++
    this.map.set(test.path, our)

    this.bar[our] = TestStatus.working
    this.push()
  }

  public onTestCaseResult(test: Test) {
    if (this.disabled) return

    const our = this.map.get(test.path) ?? 0

    this.tests[our]++
    this.push()
  }

  public onTestFileResult(test: Test, result: TestResult) {
    if (this.disabled) return

    const our = this.map.get(test.path) ?? 0

    this.bar[our] =
      result.numFailingTests > 0
        ? TestStatus.fail
        : result.skipped || result.numPendingTests > 0
        ? TestStatus.skipped
        : TestStatus.pass

    this.push()
  }

  public onRunComplete(
    _: Set<TestContext>,
    {
      numFailedTests,
      numPassedTests,
      numPendingTests,
      numTotalTests,
      startTime,
    }: AggregatedResult
  ) {
    if (this.disabled) return

    clearInterval(this.clock)
    this.estimatedTime = 0

    this.push()

    const elapsed = (Date.now() - startTime) / 1000
    const time = elapsed.toFixed(2)

    process.stderr.write(
      color.gray`Ran ${numTotalTests} tests in ${time} sec.\n`
    )

    if (numPassedTests > 0) {
      process.stderr.write(
        color.pass`${status.pass} ${numPassedTests} passing.\n`
      )
    }

    if (numPendingTests > 0) {
      process.stderr.write(
        color.skipped.bold`${status.skipped} ${numPendingTests}`
      )
      process.stderr.write(color.skipped` skipped.\n`)
    }

    if (numFailedTests > 0) {
      process.stderr.write(color.fail.bold`${status.fail} ${numFailedTests}`)
      process.stderr.write(color.fail` failing.\n`)
    }
  }

  private push() {
    this.restoreCursor()
    this.saveCursor()

    process.stderr.write("[")

    let completed = 0
    const total = this.bar.length

    for (let i = 0; i < total; i++) {
      const status = this.bar[i]
      const tests = this.tests[i]

      if (status === TestStatus.pending) process.stderr.write(" ")
      else {
        const isWorking = status === TestStatus.working

        const symbol = this.getPattern(isWorking ? tests : -1)
        process.stderr.write(color[status](symbol))

        completed += isWorking ? 0 : 1
      }
    }

    const percent = ((100 * completed) / total).toFixed(0)

    process.stderr.write("] ")
    process.stderr.write(`${percent}% `)
    process.stderr.write(`(${completed}/${total})`)

    if (this.estimatedTime > 0)
      process.stderr.write(`\nEstimated ${this.estimatedTime} sec.`)
    else if (this.estimatedTime == 0) {
      process.stderr.write(`\n\u001B[2K`)

      this.estimatedTime = -1
    }
  }

  private saveCursor() {
    process.stderr.write(isTerminalApp ? "\u001B7" : "\u001B[s")
  }

  private restoreCursor() {
    process.stderr.write(isTerminalApp ? "\u001B8" : "\u001B[u")
  }

  private getPattern(tests: number) {
    if (tests == 0) return "⠢"
    if (tests == -1 || tests >= 7) return "⣿"
    if (tests == 1 || tests == 3) return "⠢"
    if (tests == 2 || tests == 4) return "⠔"

    return "⠶"
  }

  private tick() {
    this.estimatedTime = Math.max(0, this.estimatedTime - 1)
  }

  getLastError() {}
}

export { JestReporterDot }
