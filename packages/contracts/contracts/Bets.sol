// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Bets {
    // eventType:
    // 0: soccer
    // 1: basketball
    // 2: football
    struct Event {
        uint id;
        uint eventType;
        string name;
        string team1name;
        string team2name;
        string team1imgurl;
        string team2imgurl;
        string time;
        uint8 result; // 0: Not set, 1: Team1 wins, 2: Team2 wins, 3: Draw
        bool isActive;
        // Odds system (multiplied by 100, e.g., 250 = 2.50x)
        uint256 oddsTeam1;
        uint256 oddsTeam2;
        uint256 oddsDraw;
        // Statistics
        uint256 totalBetsTeam1;
        uint256 totalBetsTeam2;
        uint256 totalBetsDraw;
    }

    struct Bet {
        uint eventId;
        address payable better;
        uint8 predictedResult; // 1: Team1 wins, 2: Team2 wins, 3: Draw
        uint amount;
        uint256 odds; // Odds at the time of bet placement
        bool paid;
    }

    address private owner;
    uint private nextEventId;
    mapping(uint => Event) public events;
    mapping(uint => Bet[]) public eventBets;

    event BetPlaced(
        uint indexed eventId,
        address indexed better,
        uint amount,
        uint8 predictedResult,
        uint256 odds
    );
    event BetPaid(uint indexed eventId, address indexed better, uint amount);
    event OddsUpdated(uint indexed eventId, uint256 oddsTeam1, uint256 oddsTeam2, uint256 oddsDraw);

    constructor() {
        owner = msg.sender;
        nextEventId = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createEvent(
        uint eventType,
        string memory name,
        string memory team1name,
        string memory team2name,
        string memory team1imgurl,
        string memory team2imgurl,
        string memory time,
        uint256 oddsTeam1,
        uint256 oddsTeam2,
        uint256 oddsDraw
    ) public onlyOwner {
        require(oddsTeam1 >= 100 && oddsTeam2 >= 100 && oddsDraw >= 100, "Odds must be >= 1.00");
        
        events[nextEventId] = Event(
            nextEventId,
            eventType,
            name,
            team1name,
            team2name,
            team1imgurl,
            team2imgurl,
            time,
            0,
            true,
            oddsTeam1,
            oddsTeam2,
            oddsDraw,
            0,
            0,
            0
        );
        nextEventId++;
    }

    function placeBet(uint eventId, uint8 predictedResult) public payable {
        require(events[eventId].isActive, "Event is not active");
        require(msg.value > 0, "Bet amount must be greater than zero");
        require(
            predictedResult >= 1 && predictedResult <= 3,
            "Invalid predicted result"
        );

        Event storage eventData = events[eventId];
        uint256 currentOdds;

        if (predictedResult == 1) {
            currentOdds = eventData.oddsTeam1;
            eventData.totalBetsTeam1 += msg.value;
        } else if (predictedResult == 2) {
            currentOdds = eventData.oddsTeam2;
            eventData.totalBetsTeam2 += msg.value;
        } else {
            currentOdds = eventData.oddsDraw;
            eventData.totalBetsDraw += msg.value;
        }

        eventBets[eventId].push(
            Bet(eventId, payable(msg.sender), predictedResult, msg.value, currentOdds, false)
        );

        emit BetPlaced(eventId, msg.sender, msg.value, predictedResult, currentOdds);
    }

    function updateOdds(
        uint eventId,
        uint256 oddsTeam1,
        uint256 oddsTeam2,
        uint256 oddsDraw
    ) public onlyOwner {
        require(events[eventId].isActive, "Event is not active");
        require(oddsTeam1 >= 100 && oddsTeam2 >= 100 && oddsDraw >= 100, "Odds must be >= 1.00");

        events[eventId].oddsTeam1 = oddsTeam1;
        events[eventId].oddsTeam2 = oddsTeam2;
        events[eventId].oddsDraw = oddsDraw;

        emit OddsUpdated(eventId, oddsTeam1, oddsTeam2, oddsDraw);
    }

    function setEventResult(uint eventId, uint8 result) public onlyOwner {
        require(events[eventId].isActive, "Event is not active");
        require(result >= 1 && result <= 3, "Invalid result");

        events[eventId].result = result;
        events[eventId].isActive = false;
    }

    function payBets(uint eventId) public onlyOwner {
        require(!events[eventId].isActive, "Event is still active");
        require(events[eventId].result != 0, "Event result is not set");

        for (uint i = 0; i < eventBets[eventId].length; i++) {
            Bet storage bet = eventBets[eventId][i];
            if (bet.predictedResult == events[eventId].result && !bet.paid) {
                // Calculate payout: betAmount * odds / 100
                uint payout = (bet.amount * bet.odds) / 100;

                (bool sent, ) = bet.better.call{value: payout}("");
                require(sent, "Failed to send Ether");

                bet.paid = true;
                emit BetPaid(eventId, bet.better, payout);
            }
        }
    }

    function getActiveEvents() public view returns (Event[] memory) {
        uint totalEvents = 0;

        for (uint i = 0; i < nextEventId; i++) {
            if (events[i].isActive) {
                totalEvents++;
            }
        }

        Event[] memory allEvents = new Event[](totalEvents);
        uint index = 0;
        for (uint i = 0; i < nextEventId; i++) {
            if (events[i].isActive) {
                allEvents[index] = events[i];
                index++;
            }
        }
        return allEvents;
    }

    function getEventById(uint _id) public view returns (Event memory) {
        return events[_id];
    }

    function getEventStats(uint eventId) public view returns (
        uint256 totalBetsTeam1,
        uint256 totalBetsTeam2,
        uint256 totalBetsDraw,
        uint256 totalPool
    ) {
        Event memory eventData = events[eventId];
        return (
            eventData.totalBetsTeam1,
            eventData.totalBetsTeam2,
            eventData.totalBetsDraw,
            eventData.totalBetsTeam1 + eventData.totalBetsTeam2 + eventData.totalBetsDraw
        );
    }

    function getUserBets(address user) public view returns (Bet[] memory) {
        uint totalBets = 0;

        for (uint i = 0; i < nextEventId; i++) {
            for (uint j = 0; j < eventBets[i].length; j++) {
                if (eventBets[i][j].better == user) {
                    totalBets++;
                }
            }
        }

        Bet[] memory userBets = new Bet[](totalBets);
        uint index = 0;

        for (uint i = 0; i < nextEventId; i++) {
            for (uint j = 0; j < eventBets[i].length; j++) {
                if (eventBets[i][j].better == user) {
                    userBets[index] = eventBets[i][j];
                    index++;
                }
            }
        }

        return userBets;
    }

    // Allow contract to receive ETH for house bankroll
    receive() external payable {}
}
