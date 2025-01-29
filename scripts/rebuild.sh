bun run src/oas-generation/download-oas.ts

bun run src/transform-oas.ts

bun run src/check.ts



cd ..
rm -rf docs/reference
bunx writedocs api

cd scripts
bun run src/oas-generation/gen-api-menu.ts