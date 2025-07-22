@echo off
set DOTNET_ENVIRONMENT=Development
set ASPNETCORE_ENVIRONMENT=Development
set DATABASE_CONNECTION=Server=vroomvroom.click;Database=SWP-PROTOTYPE;User Id=sa;Password=De@190569;TrustServerCertificate=True;
set JWT_KEY="@TcKISCd(/]3gI)p[B!01%EOW:S[W#r;&Mp}N:~k}iaN*J0*i{>=``)%eCFdtmK"
set JWT_ISSUER=VroomVroomAPI
set JWT_AUDIENCE=VroomVroomClient
set JWT_DURATION=60

set MyCustomSetting=SomeValue

rental-services.Server.exe

pause