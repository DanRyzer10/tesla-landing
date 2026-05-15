import {test, expect} from "@playwright/test"
test("deberia cargar la pagina correctamente",async ({page}) =>{
    await page.goto("http://localhost:4321")
    await expect(page).toHaveTitle("Tesla Fake")

})
test("deberian cargarse los componentes correctamente",async({page})=>{
    await page.goto("http://localhost:4321")
    const heroSection =page.locator("[data-testid='hero-section']").first()
    const chargeSection = page.locator("[data-testid='charge-section']").first()
    const header = page.locator("header").first()
    await expect(heroSection).toBeVisible()
    await expect(chargeSection).toBeVisible()
    await expect(header).toHaveClass(/hero-landing/)
    
})

test("logica de los botones", async ({page})=>{
    await page.goto("http://localhost:4321")

    page.on("dialog", async  dialog => {
        expect(dialog.message()).toBe("Explorar inventario")

        await dialog.accept()
    })

    await page
    .locator('[data-testid="explore-button"]').first()
    .click();
})

test("boton redirige a tesla", async ({browser,page}) => {
    await page.goto("http://localhost:4321")
    const context = page.context()
    const [newPage] = await  Promise.all([
        context.waitForEvent("page"),
        page.locator('[data-testid="tesla-link"]').first().click()
    
    ])
    await newPage.waitForLoadState()
    expect(newPage.url()).toBe("https://www.tesla.com/")
})