require 'sinatra'
require 'csv'
require 'active_support'
require 'active_support/core_ext'
require 'active_support/core_ext/time'

if development?
  require "sinatra/reloader" # Automatic file reloading
  require 'pry-byebug' # Debugger
end

# Enable CORS so that we can easily serve the backend and frontend from different
# host/port combos (eg localhost:1234 and localhost:4567).  In real life we'd
# want to limit this to only our actual hosts (or just set up a proxy such that
# both the frontend and backend are available via the same public host)
before do
  headers('Access-Control-Allow-Origin' => '*')
end

# Gets available slots for a given set of coaches.  A slot consists of a start
# time (in UTC) and a coach name (an arbitrary string).  There will usually be
# many slots for the same coach.
#
# Slots are provided for the next 7 days starting from the request time.
#
# Slots will be returned in sorted order of start time.
#
# Results look like:
#
# [{
#   "start": "2019-09-23T14:00:00.000Z",
#   "coach": "Christy Schumm"
# },
# {
#   "start": "2019-09-23T14:00:00.000Z",
#   "coach": "Elyssa O'Kon"
# },
# {
#   "start": "2019-09-23T14:30:00.000Z",
#   "coach": "Christy Schumm"
# }]
#
get '/slots' do
  slot_size = 30 # TODO: make this a parameter and pass it in from the frontend
  coaches = coach_slots(slot_size)
  coaches.to_json
end

# Accepts a new appointment and persists it.
#
# Expects an appointment to be an object in the same format as given by the
# /slots endpoint, as a json body to the request.
post '/appointments' do
  slot = JSON.parse(request.body.read)
  puts "Saving #{slot}"
  # TODO: Validate input.  Also use a real database instead of a file.
  open('appointments.txt', 'a') do |f|
    f.puts slot.to_json
  end
end

# Returns
# [
#   {
#    "start": "2019-01-01T14:00:00.000Z",
#    "coach": "Christy Schumm"
#   },
#   {...},
# ]
# Times are all as utc datetime objects in the next 7 days
def coach_slots(slot_size = 30)
  slots = []

  # For each coach availability period (eg 3pm-7pm)...
  load_coaches.each do |availability|

    # Use the timezone provided by the coach.  We're going to use the timezone
    # name (eg America/Yakutat) rather than the offset, since the offsets can
    # be inaccurate depending on daylight savings time.
    timezone_name = availability[:Timezone].split(' ', 2).last
    Time.use_zone(timezone_name) do

      # Get the next date with the same week day (eg 'Sunday') as this
      # availability slot, as a datetime
      day_sym = availability[:'Day of Week'].downcase.to_sym
      day = Time
        .now
        .in_time_zone
        .next_occurring(day_sym)

      # Get the availability slot's start as a datetime on that day
      available_at = Time.parse(availability[:'Available at'])
      availability_start =
        day.change(hour: available_at.hour, minute: available_at.min, seconds: 0)

      # Get the availability slot's end as a datetime on that day
      available_until = Time.parse(availability[:'Available until'])
      availability_finish =
        day.change(hour: available_until.hour, min: available_until.min)

      # Starting from availability_start, roll forward in increments of X
      # minutes and add each to the list of timeslots for this coach.
      current_time = availability_start
      loop do
        slots << { start: current_time.utc, coach: availability[:Name] }
        current_time = current_time.advance(minutes: slot_size)
        break if current_time >= availability_finish
      end
    end
  end
  slots.sort_by { |slot| slot[:start] }
end

# Return raw coach hashes from the csv
def load_coaches
  coach_data = load_csv('coaches.csv')
end

# Returns an array of hashes with column names as keys
def load_csv(filename)
  return [] unless File.exists?(filename)
  CSV
    .foreach(filename, headers: true)
    .map { |row| row.to_h.symbolize_keys }
end
