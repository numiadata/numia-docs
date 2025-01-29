bun run src/cmd/download-oas.ts

bun run src/cmd/transform-oas.ts

bun run src/cmd/check.ts


cd ..
rm -rf docs/reference
bunx writedocs api

cd scripts
bun run src/cmd/generate-menu.ts