FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build


# Set the working directory
WORKDIR /app

# Copy the solution and test project files
COPY ./sani-task.sln ./
COPY ./tests/UsersService.Tests/*.csproj ./tests/UsersService.Tests/
COPY ./users-service/*.csproj ./users-service/

# Restore dependencies
RUN dotnet restore

# Copy the entire project
COPY . ./

# Build and run tests
WORKDIR /app/tests/UsersService.Tests
RUN dotnet test --no-restore --verbosity normal
