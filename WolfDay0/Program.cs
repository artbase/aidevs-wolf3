using System;
using System.Threading.Tasks;
using RestSharp;
using Newtonsoft.Json;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("Hello number 5!");
        var arrayOfStrings = new string[2];
        #region gettin data
        // Create a new RestClient instance for fetching data
        var dataClient = new RestClient("https://poligon.aidevs.pl");
        // Create a new request for the data
        var dataRequest = new RestRequest("dane.txt", Method.Get);

        try
        {
            // Send the GET request to fetch the data
            var dataResponse = await dataClient.ExecuteAsync(dataRequest);

            // Check if the request was successful
            if (dataResponse.IsSuccessful)
            {
                Console.WriteLine("Fetched data:");
                
                // Parse the content into an array of strings
                string[] parsedArray = dataResponse.Content.Split('\n', StringSplitOptions.RemoveEmptyEntries)
                                                   .Select(line => line.Trim())
                                                   .ToArray();
                arrayOfStrings = parsedArray;
                Console.WriteLine($"Parsed array length: {parsedArray.Length}");
            }
            else
            {
                Console.WriteLine($"Error fetching data: {dataResponse.StatusCode} - {dataResponse.ErrorMessage}");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error fetching data: {e.Message}");
        }
        #endregion

        #region sending data
        // Create a new RestClient instance
        var client = new RestClient("https://poligon.aidevs.pl");
        // Create a new request
        var request = new RestRequest("/verify", Method.Post);

        // Create the data structure
        var dataToSend = new
        {
            task = "POLIGON", // Replace with the actual task ID
            apikey = "[apikey]", // Replace with your actual API key
            answer = arrayOfStrings
        };

        // Serialize the data to JSON and add it to the request body
        request.AddJsonBody(JsonConvert.SerializeObject(dataToSend));

        try
        {
            // Send the POST request
            var response = await client.ExecuteAsync(request);

            // Check if the request was successful
            if (response.IsSuccessful)
            {
                Console.WriteLine("Response:");
                Console.WriteLine(response.Content);
            }
            else
            {
                Console.WriteLine($"Error: {response.StatusCode} - {response.Content}");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error: {e.Message}");
        }
        #endregion
    }
}



