import XCTest

final class ReleaseTests: XCTestCase {
    func testChapterSurvivesBackgroundAndTermination() throws {
        continueAfterFailure = false
        let app = XCUIApplication()
        app.launch()
        func button(_ text: String) -> XCUIElement {
            app.buttons.matching(NSPredicate(format: "label CONTAINS %@", text)).firstMatch
        }
        func tap(_ text: String) {
            let element = button(text)
            XCTAssertTrue(element.waitForExistence(timeout: 15), "Missing button: \(text)\n\(app.debugDescription)")
            for _ in 0..<5 where !element.isHittable { app.swipeUp() }
            element.tap()
        }
        if button("Skip to today").waitForExistence(timeout: 2) { tap("Skip to today") }
        tap("Settings"); tap("Reset all local data"); app.buttons["Confirm"].tap()
        XCTAssertTrue(app.staticTexts["Settings & About"].waitForNonExistence(timeout: 10))
        app.terminate(); app.launch()
        tap("Check")
        XCTAssertTrue(button("Use guess 1").waitForExistence(timeout: 10), "The worked example offers a real editable guess")
        app.terminate(); app.launch()
        XCTAssertTrue(button("Use guess 1").waitForExistence(timeout: 10), "Warm-up survives relaunch")
        tap("Skip to today"); tap("Home"); tap("Play Story")
        XCTAssertFalse(button("Chapter 2").isEnabled, "The next chapter starts locked")
        tap("Prelude · A thief in the treasury")
        XCTAssertTrue(button("Add Thief").waitForExistence(timeout: 10), "The skipped tutorial stays available from Stories")
        tap("Back to home"); tap("Play Story"); tap("Chapter 1")
        tap("Arrange this scene"); tap("Add Thief")
        let placed = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Place 1: Thief")).firstMatch
        XCTAssertTrue(placed.waitForExistence(timeout: 10))
        XCUIDevice.shared.press(.home)
        app.activate()
        XCTAssertTrue(placed.waitForExistence(timeout: 10))
        app.terminate(); app.launch()
        tap("Home"); tap("Play Story"); tap("Continue story")
        XCTAssertTrue(placed.waitForExistence(timeout: 10), "Preferences should restore the draft after termination")
        tap("Add Ale"); tap("Add Knight"); tap("Check arrangement")
        XCTAssertTrue(app.staticTexts["Scene solved"].waitForExistence(timeout: 10))
        let attachment = XCTAttachment(screenshot: app.screenshot()); attachment.lifetime = .keepAlways; add(attachment)
    }
}
