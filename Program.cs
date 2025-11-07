Console.WriteLine("Testing database connection...");

if (DatabaseConnection.TestConnection())
{
    Console.WriteLine("✓ Connection successful!");
}
else
{
    Console.WriteLine("✗ Connection failed!");
}
